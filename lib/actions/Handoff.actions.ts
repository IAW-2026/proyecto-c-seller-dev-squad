"use server";

import { auth } from "@clerk/nextjs/server";
import { generateToken } from "@/lib/handoffToken";
import { prisma } from "@/lib/prisma";

export async function getSellerReviewsUrl() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autenticado");
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!seller) {
    throw new Error("Seller inexistente");
  }

  const token = await generateToken(
    process.env.API_KEY_SELLER_APP!,
    {
      userId,
      targetId: seller.id,
    }
  );

  return `${process.env.FEEDBACK_APP_URL}/explorar/vendedor/${seller.id}?token=${token}`;
}