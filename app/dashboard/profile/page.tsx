import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export default async function ProfilePage() {
  const effectiveUserId = await getEffectiveUserId();

  if (!effectiveUserId) redirect("/sign-in");

  const seller = await prisma.seller.findUnique({
    where: { clerkUserId: effectiveUserId },
    select: { name: true, email: true, description: true, avatar_url: true },
  });

  if (!seller) redirect("/onboarding");

  return (
    <ProfileClient
      seller={{
        name:        seller.name,
        email:       seller.email,
        description: seller.description,
        avatarUrl:   seller.avatar_url,
      }}
    />
  );
}