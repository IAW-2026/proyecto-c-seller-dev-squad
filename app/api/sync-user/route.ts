import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {

  const body = await req.json();

  const {
    clerkUserId,
    email,
    firstName,
    lastName,
  } = body;

  const seller = await prisma.seller.upsert({
    where: {
      clerkUserId,
    },
    update: {
      email,
      name: `${firstName} ${lastName}`,
    },
    create: {
      clerkUserId,
      email,
      name: `${firstName} ${lastName}`,
    },
  });

  return NextResponse.json({
    ok: true,
    seller,
  });
}