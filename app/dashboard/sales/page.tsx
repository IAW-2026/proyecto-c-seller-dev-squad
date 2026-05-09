// app/dashboard/sales/page.tsx
// Historial de ventas del vendedor con filtros por estado y paginación

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SalesClient from "./SalesClient";

const PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ estado?: string; page?: string; q?: string }>;
}

export default async function SalesPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");
  const { estado, page: pageParam, q: qParam } = await searchParams;

  const page   = Math.max(1, Number(pageParam ?? "1"));
  const estado_ = estado as "CONFIRMADO" | "PENDIENTE" | "CANCELADO" | undefined;
  const q      = qParam ?? "";

  const where = {
    vendedorId: vendedor.id,
    ...(estado_ && { estado: estado_ }),
    ...(q && { ordenId: { contains: q, mode: "insensitive" as const } }),
  };

  const [total, ventas, resumen] = await Promise.all([
    prisma.venta.count({ where }),
    prisma.venta.findMany({
      where,
      include: {
        detalles: {
          include: { producto: { select: { nombre: true, marca: true, imagenUrl: true } } },
        },
      },
      orderBy: { creadoEn: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.venta.groupBy({
      by: ["estado"],
      where: { vendedorId: vendedor.id },
      _count: { estado: true },
      _sum:   { total: true },
    }),
  ]);

  const totalPorEstado = Object.fromEntries(
    resumen.map((r) => [r.estado, { count: r._count.estado, sum: Number(r._sum.total ?? 0) }])
  ) as Record<string, { count: number; sum: number }>;

  return (
    <SalesClient
      ventas={ventas.map((v) => ({
        id:       v.id,
        ordenId:  v.ordenId,
        total:    Number(v.total),
        estado:   v.estado as "CONFIRMADO" | "PENDIENTE" | "CANCELADO",
        creadoEn: v.creadoEn.toISOString(),
        detalles: v.detalles.map((d) => ({
          cantidad:       d.cantidad,
          precioUnitario: Number(d.precioUnitario),
          talle:          d.talle ?? "",
          producto: {
            nombre:    d.producto.nombre,
            marca:     d.producto.marca ?? "",
            imagenUrl: d.producto.imagenUrl ?? null,
          },
        })),
      }))}
      total={total}
      page={page}
      perPage={PER_PAGE}
      estadoFiltro={estado ?? ""}   
      q={q}
      resumen={totalPorEstado}
    />
  );
}