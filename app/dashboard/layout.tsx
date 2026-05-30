import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClientLayout from "./DashBoardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    null;

  if (role === "admin") {
    return <DashboardClientLayout>{children}</DashboardClientLayout>;
  }

  const seller = await prisma.seller.findUnique({
    where: { clerkUserId: userId },
    select: { active: true },
  });

  if (!seller) redirect("/onboarding");
  if (!seller.active) redirect("/unauthorized");

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}