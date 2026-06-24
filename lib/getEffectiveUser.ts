import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { verifySellerToken } from "./sellerToken";

export async function getEffectiveUserId() {
  const { userId } = await auth();

  if (userId) {
    return userId;
  }

  const token =
    (await cookies()).get("seller_handoff")?.value;

console.log(
  "[EFFECTIVE] cookie:",
  (await cookies()).get("seller_handoff")
);

  if (!token) {
    return null;
  }

  const verified =
    await verifySellerToken(token);

  return verified?.clerkId ?? null;
}