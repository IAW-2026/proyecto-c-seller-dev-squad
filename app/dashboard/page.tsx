import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySellerToken } from "@/lib/sellerToken";
import DashboardClient from "./DashboardClient";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {

  const {
    userId,
    sessionClaims,
  } = await auth();

  const effectiveUserId =
  await getEffectiveUserId();

  console.log("[DASHBOARD] userId:", userId);
  console.log(
    "[DASHBOARD] effectiveUserId:",
    effectiveUserId
  );
  console.log(
    "[DASHBOARD] sessionClaims:",
    sessionClaims
  );

  if (!effectiveUserId) {
    redirect("/sign-in");
  }

  const role =
    (sessionClaims?.metadata as any)?.role ??
    (sessionClaims?.publicMetadata as any)?.role ??
    null;

  if (role === "admin") {
    redirect("/dashboard/admin");
  }

  const seller = await prisma.seller.findFirst({
    where: {
      clerkUserId: effectiveUserId,
    },
  });

  if (!seller) {
    redirect("/onboarding");
  }

  // ... todo el resto de tu código queda igual

  const [total_products, total_Ventas, ventas,  productosBajoStock] = await Promise.all([
    prisma.product.count({
      where: {
        sellerId:  seller.id,
        active: true,
      },
    }),

    prisma.sell.count({
      where: {  sellerId:  seller.id, },
    }),

    prisma.sell.findMany({
      where: {sellerId:  seller.id,},
      include: {
        details: {
          include: {
             product: true,
          },
        },
      },
      orderBy: { createdAt: "desc",},
      take: 50,
    }),

    prisma.product.findMany({
     where: {
       sellerId:  seller.id,
       active: true,
      },
      include: {sizes: true},
      take: 5,
      orderBy: { stock: "asc" },
   }),
]);

  const ingresoTotal = ventas
    .filter((v) => v.status=== "CONFIRMED")
    .reduce((acc, v) => acc + Number(v.total), 0);

  const ventasPorEstado = {
    CONFIRMED: ventas.filter((v) => v.status=== "CONFIRMED").length,

    PENDING: ventas.filter((v) => v.status=== "PENDING").length,

    CANCELLED: ventas.filter((v) => v.status=== "CANCELLED").length,
  };

  const stockReal = (p: typeof  productosBajoStock[0]) =>
  p.sizes.length > 0
    ? p.sizes.reduce((a, t) => a + t.stock, 0)
    : p.stock;

  const  productosBajoStockFiltrados =  productosBajoStock
  .map((p) => ({ ...p, stockCalculado: stockReal(p) }))
  .filter((p) => p.stockCalculado <= 3)
  .sort((a, b) => a.stockCalculado - b.stockCalculado)
  .slice(0, 5);

  return (
    <DashboardClient
       seller={{
         name:  seller. name,
        email:  seller.email,
      }}

      metricas={{
        total_products,
        total_Ventas,
        ingresoTotal,
        ventasPorEstado,
      }}

      ventasRecientes={ventas.slice(0, 10).map((v) => ({
        id: v.id,
        orderId: v.orderId,
        total: Number(v.total),
        status: v.status,
        createdAt: v.createdAt.toISOString(),
        items: v.details.length,
      }))}

       productosBajoStock={ productosBajoStockFiltrados.map((p) => ({
        id: p.id,
         name: p. name,
        stock: p.stockCalculado,
        brand: p.brand ?? "",
      }))}
    />
  );
}

