import { verifySellerToken } from "@/lib/sellerToken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/sign-in");
  }

  const verified = await verifySellerToken(token);

  if (!verified) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();

  cookieStore.set("seller_handoff", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: verified.userId,
    },
  });

  if (seller) {
    redirect("/dashboard");
  }

  redirect("/onboarding");
}