import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) redirect("/sign-in");

  const role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    null;

  if (role === "admin") {
    redirect("/dashboard/admin");
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (seller) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}