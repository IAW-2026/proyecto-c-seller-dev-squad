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

  console.log("[HANDOFF] token:", token);

  if (!token) {
    redirect("/sign-in");
  }

const verified =
  await verifySellerToken(token);

console.log("[HANDOFF] verified:", verified);

if (!verified) {
  redirect("/sign-in");
}

console.log("[HANDOFF] searching seller for:", verified.userId);

const seller =
  await prisma.seller.findUnique({
    where: {
      clerkUserId: verified.userId,
    },
  });

  console.log("[HANDOFF] seller:", seller);

if (seller) {
  redirect("/dashboard");
}

redirect("/onboarding");
}