const SECRET = process.env.BUYER_SECRET!;

async function getKey() {
  const enc = new TextEncoder();

  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64urlEncode(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);

  let str = "";

  for (const b of arr) {
    str += String.fromCharCode(b);
  }

  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");

  while (str.length % 4) {
    str += "=";
  }

  const bin = atob(str);

  const arr = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }

  return arr.buffer;
}

type SellerTokenPayload = {
  userId: string;
  exp: number;
};

export async function generateSellerToken(
  data: { userId: string },
  ttlSeconds = 180
): Promise<string> {
  const payload: SellerTokenPayload = {
    userId: data.userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadBytes = new TextEncoder().encode(
    JSON.stringify(payload)
  );

  const payloadB64 = base64urlEncode(
    payloadBytes.buffer as ArrayBuffer
  );

  const key = await getKey();

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );

  const sigB64 = base64urlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

export async function verifySellerToken(
  token: string
): Promise<{ userId: string } | null> {
  const [payloadB64, sigB64] = token.split(".");

  if (!payloadB64 || !sigB64) {
    return null;
  }

  try {
    const key = await getKey();

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64)
    );

    if (!valid) {
      return null;
    }

    const payload: SellerTokenPayload = JSON.parse(
      new TextDecoder().decode(
        base64urlDecode(payloadB64)
      )
    );

    if (
      payload.exp <
      Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}