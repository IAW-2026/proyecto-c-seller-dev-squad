import { verifySellerToken } from "@/lib/sellerToken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    theme?: string;
  }>;
}) {
  const { token, theme } = await searchParams;

  if (!token) {
    redirect("/sign-in");
  }

const verified =
  await verifySellerToken(token);

if (!verified) {
  redirect("/sign-in");
}

const seller =
  await prisma.seller.findUnique({
    where: {
      clerkUserId: verified.clerkId,
    },
  });

const base = seller ? "/dashboard" : "/onboarding";
const url = theme === "light" || theme === "dark"
  ? `${base}?theme=${theme}`
  : base;

redirect(url);
}