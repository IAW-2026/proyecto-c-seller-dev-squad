function base64urlEncode(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

async function getKey(secret: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

type HandoffPayload = {
  userId: string;
  targetId: string;
  exp: number;
};

export async function generateToken(
  secret: string,
  data: { userId: string; targetId: string },
  ttlSeconds = 180
): Promise<string> {
  const payload: HandoffPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = base64urlEncode(payloadBytes.buffer as ArrayBuffer);

  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const sigB64 = base64urlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

export async function verifyToken(
  secret: string,
  token: string,
  expectedTargetId: string
): Promise<{ userId: string } | null> {
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload: HandoffPayload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadB64))
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.targetId !== expectedTargetId) return null;

    return { userId: payload.userId };
  } catch {
    return null;
  }
}