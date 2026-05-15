import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // si ya tiene vendedor, mandar al dashboard
  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (vendedor) redirect("/dashboard");

  return <OnboardingForm />;
}