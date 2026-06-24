import { verifySellerToken } from "@/lib/sellerToken";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

if (seller) {
  redirect("/dashboard");
}

redirect("/onboarding");
}