import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // si ya tiene  seller, mandar al dashboard
  const seller= await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (seller) redirect("/dashboard");

  return <OnboardingForm />;
}