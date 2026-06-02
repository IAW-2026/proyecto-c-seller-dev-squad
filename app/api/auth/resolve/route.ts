import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({
      redirectTo: "/sign-in",
    });
  }

  const role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    null;

  if (role === "admin") {
    return NextResponse.json({
      redirectTo: "/dashboard/admin",
    });
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!seller) {
    return NextResponse.json({
      redirectTo: "/onboarding",
    });
  }

  return NextResponse.json({
    redirectTo: "/dashboard",
  });
}