import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";


export default async function ProfilePage() {
  const { userId } = await auth();

  const effectiveUserId =
    await getEffectiveUserId();
  
    if (!effectiveUserId) {
      redirect("/sign-in");
    }

  const seller = await prisma.seller.findUnique({
    where: { clerkUserId: effectiveUserId },
    select: { name: true, email: true, description: true },
  });

  if (!seller) redirect("/onboarding");

  return <ProfileClient seller={seller} />;
}