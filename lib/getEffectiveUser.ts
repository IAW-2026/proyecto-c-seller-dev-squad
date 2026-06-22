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

  if (!token) {
    return null;
  }

  const verified =
    await verifySellerToken(token);

  return verified?.userId ?? null;
}