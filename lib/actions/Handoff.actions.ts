"use server";

import { getEffectiveUserId } from "@/lib/getEffectiveUser";
import { generateToken } from "@/lib/handoffToken";
import { prisma } from "@/lib/prisma";

export async function getSellerReviewsUrl() {
  const effectiveUserId =
    await getEffectiveUserId();

  if (!effectiveUserId) {
    throw new Error("No autenticado");
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: effectiveUserId,
    },
  });

  if (!seller) {
    throw new Error("Seller inexistente");
  }

  const token = await generateToken(
    process.env.API_KEY_SELLER_APP!,
    {
      userId: effectiveUserId,
      targetId: seller.id,
    }
  );

  return `${process.env.FEEDBACK_APP_URL}/explorar/vendedor/${seller.id}?token=${token}`;
}