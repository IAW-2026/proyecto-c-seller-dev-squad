import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sellers = await prisma.seller.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      email: true,
      description: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json(sellers);
}