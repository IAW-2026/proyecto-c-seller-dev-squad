import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";
 
export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
 
  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/onboarding");
 
  const [vendedores, productos, ventas] = await Promise.all([
    prisma.vendedor.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        _count: { select: { productos: true, ventas: true } },
      },
    }),
    prisma.producto.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        vendedor: { select: { nombre: true } },
        _count: { select: { detallesVenta: true } },
      },
    }),
    prisma.venta.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        vendedor: { select: { nombre: true } },
        _count: { select: { detalles: true } },
      },
      take: 50,
    }),
  ]);
 
  const stats = {
    totalVendedores:       vendedores.length,
    vendedoresActivos:     vendedores.filter(v => v.activo).length,
    totalProductos:        productos.length,
    productosActivos:      productos.filter(p => p.activo).length,
    totalVentas:           ventas.length,
    ventasConfirmadas:     ventas.filter(v => v.estado === "CONFIRMADO").length,
    ingresoTotal:          ventas.filter(v => v.estado === "CONFIRMADO").reduce((a, v) => a + Number(v.total), 0),
  };
 
  return (
    <AdminClient
      stats={stats}
      vendedores={vendedores.map(v => ({
        id:          v.id,
        nombre:      v.nombre,
        email:       v.email,
        descripcion: v.descripcion ?? "",
        activo:      v.activo,
        creadoEn:    v.creadoEn.toISOString(),
        totalProductos: v._count.productos,
        totalVentas:    v._count.ventas,
      }))}
      productos={productos.map(p => ({
        id:        p.id,
        nombre:    p.nombre,
        marca:     p.marca ?? "",
        precio:    Number(p.precio),
        stock:     p.stock,
        activo:    p.activo,
        creadoEn:  p.creadoEn.toISOString(),
        vendedor:  p.vendedor.nombre,
        totalVentas: p._count.detallesVenta,
      }))}
      ventas={ventas.map(v => ({
        id:        v.id,
        ordenId:   v.ordenId,
        total:     Number(v.total),
        estado:    v.estado as "CONFIRMADO" | "PENDIENTE" | "CANCELADO",
        creadoEn:  v.creadoEn.toISOString(),
        vendedor:  v.vendedor.nombre,
        items:     v._count.detalles,
      }))}
    />
  );
}