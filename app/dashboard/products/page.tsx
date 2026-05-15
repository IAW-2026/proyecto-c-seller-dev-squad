// Lista de productos del vendedor con búsqueda y paginación por URL

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

const PER_PAGE = 8;

interface Props {
  searchParams: Promise<{ q?: string; page?: string; estado?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");

  const { q: rawQ, page: rawPage, estado } = await searchParams; 

  const q    = rawQ ?? "";
  const page = Math.max(1, Number(rawPage ?? "1"));
  const activo = estado === "inactivo" ? false
               : estado === "activo"   ? true
               : undefined;

  const where = {
    vendedorId: vendedor.id,
    ...(activo !== undefined && { activo }),
    ...(q && {
      OR: [
        { nombre:      { contains: q, mode: "insensitive" as const } },
        { marca:       { contains: q, mode: "insensitive" as const } },
        { descripcion: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      include: { talles: true },
      orderBy: { creadoEn: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  return (
    <ProductsClient
      productos={productos.map((p) => ({
        id:        p.id,
        nombre:    p.nombre,
        marca:     p.marca ?? "",
        precio:    Number(p.precio),
        stock:     p.stock,
        activo:    p.activo,
        imagenUrl: p.imagenUrl ?? null,
        talles:    p.talles.map((t) => ({ talle: t.talle, stock: t.stock })),
        creadoEn:  p.creadoEn.toISOString(),
      }))}
      total={total}
      page={page}
      perPage={PER_PAGE}
      q={q}
      estadoFiltro={estado ?? "todos"}
    />
  );
}