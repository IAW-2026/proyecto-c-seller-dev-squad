// Panel de administración del vendedor — Seller App

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const vendedor = await prisma.vendedor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  if (!vendedor) redirect("/onboarding"); 
  const [totalProductos, totalVentas, ventas, productosBajoStock] = await Promise.all([
    prisma.producto.count({
      where: {
        vendedorId: vendedor.id,
        activo: true,
      },
    }),

    prisma.venta.count({
      where: {  vendedorId: vendedor.id, },
    }),

    prisma.venta.findMany({
      where: {vendedorId: vendedor.id,},
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { creadoEn: "desc",},
      take: 50,
    }),

    prisma.producto.findMany({
     where: {
       vendedorId: vendedor.id,
       activo: true,
      },
      include: {talles: true},
      take: 5,
      orderBy: { stock: "asc" },
   }),
]);

  const ingresoTotal = ventas
    .filter((v) => v.estado === "CONFIRMADO")
    .reduce((acc, v) => acc + Number(v.total), 0);

  const ventasPorEstado = {
    CONFIRMADO: ventas.filter((v) => v.estado === "CONFIRMADO").length,

    PENDIENTE: ventas.filter((v) => v.estado === "PENDIENTE").length,

    CANCELADO: ventas.filter((v) => v.estado === "CANCELADO").length,
  };

  const stockReal = (p: typeof productosBajoStock[0]) =>
  p.talles.length > 0
    ? p.talles.reduce((a, t) => a + t.stock, 0)
    : p.stock;

  const productosBajoStockFiltrados = productosBajoStock
  .map((p) => ({ ...p, stockCalculado: stockReal(p) }))
  .filter((p) => p.stockCalculado <= 3)
  .sort((a, b) => a.stockCalculado - b.stockCalculado)
  .slice(0, 5);

  return (
    <DashboardClient
      vendedor={{
        nombre: vendedor.nombre,
        email: vendedor.email,
      }}

      metricas={{
        totalProductos,
        totalVentas,
        ingresoTotal,
        ventasPorEstado,
      }}

      ventasRecientes={ventas.slice(0, 10).map((v) => ({
        id: v.id,
        ordenId: v.ordenId,
        total: Number(v.total),
        estado: v.estado,
        creadoEn: v.creadoEn.toISOString(),
        items: v.detalles.length,
      }))}

      productosBajoStock={productosBajoStockFiltrados.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stockCalculado,
        marca: p.marca ?? "",
      }))}
    />
  );
}

