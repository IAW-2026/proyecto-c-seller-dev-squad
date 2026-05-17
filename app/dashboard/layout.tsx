import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import DashboardClientLayout from "./DashBoardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const seller= await prisma.seller.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  // Usuario autenticado pero sin  seller
  if (!seller) {
    redirect("/onboarding");
  }

  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}