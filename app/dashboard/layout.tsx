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

  // si no hay sesión Clerk, intentamos con token
  if (!effectiveUserId) {
    // NO podemos leer searchParams desde layout
    // así que para que esto funcione deberías pasar el token
    // mediante cookie o middleware
    redirect("/sign-in");
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