import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";
 
export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
 
  const seller= await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!seller) redirect("/onboarding");
 
  const [ sellers,  products, sells] = await Promise.all([
    prisma.seller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: {  products: true, sells: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {seller: { select: { name: true,},},
        sizes: true,
        _count: {
          select: {
            sellDetails: true,
          },
        },
      },
    }),
    prisma.sell.findMany({
      orderBy: { createdAt: "desc" },
      include: {
         seller: { select: {  name: true } },
        _count: { select: { details: true } },
      },
      take: 50,
    }),
  ]);
 
    const stats = {
    totalSellers: sellers.length,
    activeSellers: sellers.filter((s) => s.active).length,

    totalProducts: products.length,
    activeProducts: products.filter((p) => p.active).length,

    totalSells: sells.length,

    confirmedSells: sells.filter(
      (s) => s.status === "CONFIRMED"
    ).length,

    totalRevenue: sells
      .filter((s) => s.status === "CONFIRMED")
      .reduce((acc, s) => acc + Number(s.total), 0),
  };

return (
  <AdminClient
    stats={stats}
    sellers={sellers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      description: s.description ?? null,
      active: s.active,
      createdAt: s.createdAt.toISOString(),
      totalProducts: s._count.products,
      totalSells: s._count.sells,
    }))}

    products={products.map((p) => {
      const stockTotal =
        p.sizes.length > 0
          ? p.sizes.reduce(
              (total, size) => total + size.stock,
              0
            )
          : p.stock;

      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        stock: stockTotal,
        active: p.active,
        image: p.image ?? null,
        createdAt: p.createdAt.toISOString(),
        seller: p.seller.name,
        totalSells: p._count.sellDetails,
      };
    })}

    sells={sells.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      total: Number(s.total),
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      seller: s.seller.name,
      items: s._count.details,
    }))}
  />
);
}