import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const seller= await prisma.seller.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  return NextResponse.json( seller);
}