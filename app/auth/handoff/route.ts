import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifySellerToken } from "@/lib/sellerToken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  const verified =
    await verifySellerToken(token);

  if (!verified) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  const seller =
    await prisma.seller.findUnique({
      where: {
        clerkUserId: verified.userId,
      },
    });

  const cookieStore = await cookies();

  cookieStore.set("seller_handoff", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.redirect(
    new URL(
      seller ? "/dashboard" : "/onboarding",
      req.url
    )
  );
}