// Lista de  products del  seller con búsqueda y paginación por URL

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

const PER_PAGE = 8;

interface Props {
  searchParams: Promise<{ q?: string; page?: string; estado?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const seller= await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!seller) redirect("/onboarding");

  const { q: rawQ, page: rawPage, estado } = await searchParams; 

  const q    = rawQ ?? "";
  const page = Math.max(1, Number(rawPage ?? "1"));
  const active = estado === "inactive" ? false
               : estado === "active"   ? true
               : undefined;

  const where = {
    sellerId:  seller.id,
    ...(active !== undefined && { active }),
    ...(q && {
      OR: [
        {  name:      { contains: q, mode: "insensitive" as const } },
        { brand:       { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total,  products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { sizes: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  return (
    <Suspense fallback="Cargando...">
      <ProductsClient
         products={ products.map((p) => ({
          id:        p.id,
           name:    p. name,
          brand:     p.brand,
          category: p.category ?? null,
        direction: p.direction ?? null,
        colors:    p.colors ?? [],
        price:    Number(p.price),
        stock:     p.stock,
        active:    p.active,
        image:     p.image ?? null,
        sizes:    p.sizes.map((t) => ({ size: t.size, stock: t.stock })),
        createdAt:  p.createdAt.toISOString(),
      }))}
      total={total}
      page={page}
      perPage={PER_PAGE}
      q={q}
      estadoFiltro={estado ?? "todos"}
    />
    </Suspense>
  );
}