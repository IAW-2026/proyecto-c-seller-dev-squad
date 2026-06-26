// Historial de ventas del  seller con filtros por estado y paginación

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import SalesClient from "./SalesClient";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";


const PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ estado?: string; page?: string; q?: string }>;
}

type SellStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export default async function SalesPage({ searchParams }: Props) {
  const { userId } = await auth();

  const effectiveUserId =
  await getEffectiveUserId();

  if (!effectiveUserId) {
    redirect("/sign-in");
  }

  const seller= await prisma.seller.findUnique({ where: { clerkUserId: effectiveUserId } });
  if (!seller) redirect("/onboarding");
  const { estado, page: pageParam, q: qParam } = await searchParams;

  const page   = Math.max(1, Number(pageParam ?? "1"));
  const estadoFiltro = estado as SellStatus | undefined;
  const q      = qParam ?? "";

  const where = {
    sellerId:  seller.id,
    ...(estadoFiltro && { status: estadoFiltro }),
    ...(q && { orderId: { contains: q, mode: "insensitive" as const } }),
  };

  const [total, ventas, resumen] = await Promise.all([
    prisma.sell.count({ where }),
    prisma.sell.findMany({
      where,
      include: {
        details: {
          include: {  product: { select: {  name: true, brand: true, image: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.sell.groupBy({
      by: ["status"],
      where: { sellerId:  seller.id },
      _count: { status: true },
      _sum:   { total: true },
    }),
  ]);

  const totalPorEstado = Object.fromEntries(
    resumen.map((r) => [r.status, { count: r._count.status, sum: Number(r._sum.total ?? 0) }])
  ) as Record<string, { count: number; sum: number }>;

  return (
    <Suspense fallback={<div>Cargando...</div>}>
     <SalesClient
      sells={ventas.map((v) => ({
        id:       v.id,
        orderId:  v.orderId,
        total:    Number(v.total),
        status:   v.status as SellStatus,
        createdAt: v.createdAt.toISOString(),
        details: v.details.map((d) => ({
        quantity:       d.quantity,
        unitPrice: Number(d.unitPrice),
          size:          d.size ?? "",
          color:        d.color ?? "",
           product: {
             name:    d. product. name,
            brand:     d. product.brand ?? "",
            image: d. product.image ?? null,
          },
        })),
      }))}
      total={total}
      page={page}
      perPage={PER_PAGE}
      estadoFiltro={estadoFiltro ?? ""}   
      q={q}
      resumen={totalPorEstado}
    />
  </Suspense>
  );
}