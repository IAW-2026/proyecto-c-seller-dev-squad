import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export default async function OnboardingPage() {
  const effectiveUserId =
    await getEffectiveUserId();

  if (!effectiveUserId) {
    redirect("/sign-in");
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: effectiveUserId,
    },
  });

  if (seller) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}