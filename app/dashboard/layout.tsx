import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySellerToken } from "@/lib/sellerToken";
import DashboardClientLayout from "./DashBoardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  let effectiveUserId = userId;
  let role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    null;

    console.log("[LAYOUT] userId:", userId);
console.log("[LAYOUT] effectiveUserId:", effectiveUserId);

  // si no hay sesión Clerk, intentamos con token
  if (!effectiveUserId) {
  console.log("[LAYOUT] no user");
  return children;
}

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

  if (!seller) redirect("/onboarding");
  if (!seller.active) redirect("/unauthorized");

  return (
    <DashboardClientLayout role="seller">
      {children}
    </DashboardClientLayout>
  );
}