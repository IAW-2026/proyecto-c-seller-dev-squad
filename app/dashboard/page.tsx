// app/dashboard/page.tsx
// Panel de administración del vendedor — Seller App
// Requiere: @clerk/nextjs, prisma, lucide-react, tailwindcss

import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // datos mock para desarrollo sin Clerk
  return (
    <DashboardClient
      vendedor={{ nombre: "Brian Crowley", email: "brian@seller.com" }}
      metricas={{
        totalProductos: 8,
        totalVentas: 7,
        ingresoTotal: 364497,
        ventasPorEstado: { CONFIRMADO: 4, PENDIENTE: 2, CANCELADO: 1 },
      }}
      ventasRecientes={[
        { id: "1", ordenId: "orden-buyer-uuid-001", total: 89999,  estado: "CONFIRMADO", creadoEn: new Date().toISOString(), items: 1 },
        { id: "2", ordenId: "orden-buyer-uuid-002", total: 249998, estado: "CONFIRMADO", creadoEn: new Date().toISOString(), items: 2 },
        { id: "3", ordenId: "orden-buyer-uuid-003", total: 189999, estado: "PENDIENTE",  creadoEn: new Date().toISOString(), items: 1 },
        { id: "4", ordenId: "orden-buyer-uuid-004", total: 89999,  estado: "CANCELADO",  creadoEn: new Date().toISOString(), items: 1 },
      ]}
      productosBajoStock={[
        { id: "1", nombre: "Jordan 1 Retro High OG", stock: 1, marca: "Nike"    },
        { id: "2", nombre: "Adidas Ultraboost 23",   stock: 2, marca: "Adidas"  },
        { id: "3", nombre: "Nike Air Max 90",         stock: 3, marca: "Nike"   },
      ]}
    />
  );
}

/*

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";


export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.vendedor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendedor) redirect("/sign-in");

  // Métricas generales
  const [totalProductos, totalVentas, ventas] = await Promise.all([
    prisma.producto.count({ where: { vendedorId: vendedor.id, activo: true } }),
    prisma.venta.count({ where: { vendedorId: vendedor.id } }),
    prisma.venta.findMany({
      where: { vendedorId: vendedor.id },
      include: { detalles: { include: { producto: true } } },
      orderBy: { creadoEn: "desc" },
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

  // Productos con bajo stock
  const productosBajoStock = await prisma.producto.findMany({
    where: {
      vendedorId: vendedor.id,
      activo: true,
      stock: { lte: 3 },
    },
    take: 5,
    orderBy: { stock: "asc" },
  });

  return (
    <DashboardClient
      vendedor={{ nombre: vendedor.nombre, email: vendedor.email }}
      metricas={{ totalProductos, totalVentas, ingresoTotal, ventasPorEstado }}
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

*/