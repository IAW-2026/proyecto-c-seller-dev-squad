import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const seller = await prisma.seller.findUnique({
    where: { clerkUserId: userId },
    select: { name: true, email: true, description: true },
  });

  if (!seller) redirect("/onboarding");

  return <ProfileClient seller={seller} />;
}