// app/dashboard/page.tsx
// Panel de administración del vendedor — Seller App
// Requiere: @clerk/nextjs, prisma, lucide-react, tailwindcss

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  // Si no está autenticado
  if (!userId) {
    redirect("/sign-in");
  }

  // Buscar vendedor existente
  const vendedor = await prisma.vendedor.findFirst({
    where: {
      clerkUserId: userId,
    },
  });

  // Si no existe en DB
  if (!vendedor) redirect("/onboarding"); 
  // Métricas generales
  const [totalProductos, totalVentas, ventas] = await Promise.all([
    prisma.producto.count({
      where: {
        vendedorId: vendedor.id,
        activo: true,
      },
    }),

    prisma.venta.count({
      where: {
        vendedorId: vendedor.id,
      },
    }),

    prisma.venta.findMany({
      where: {
        vendedorId: vendedor.id,
      },

      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },

      orderBy: {
        creadoEn: "desc",
      },

      take: 50,
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

  // Productos bajo stock
  const productosBajoStock = await prisma.producto.findMany({
    where: {
      vendedorId: vendedor.id,
      activo: true,
      stock: {
        lte: 3,
      },
    },

    take: 5,

    orderBy: {
      stock: "asc",
    },
  });

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

      productosBajoStock={productosBajoStock.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        marca: p.marca ?? "",
      }))}
    />
  );
}

