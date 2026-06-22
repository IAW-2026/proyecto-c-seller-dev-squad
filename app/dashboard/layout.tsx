import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClientLayout from "./DashBoardClientLayout";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const effectiveUserId =
    await getEffectiveUserId();

  if (!effectiveUserId) {
    redirect("/sign-in");
  }

  const { sessionClaims } = await auth();

  const role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    "seller";

  if (role === "admin") {
    return (
      <DashboardClientLayout role="admin">
        {children}
      </DashboardClientLayout>
    );
  }

  const seller = await prisma.seller.findUnique({
    where: {
      clerkUserId: effectiveUserId,
    },
    select: {
      active: true,
    },
  });

  if (!seller) {
    redirect("/onboarding");
  }

  if (!seller.active) {
    redirect("/unauthorized");
  }

  return (
    <DashboardClientLayout role="seller">
      {children}
    </DashboardClientLayout>
  );
}