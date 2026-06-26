import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Superadmin-Key",
};

function checkAuth(req: NextRequest) {
  return req.headers.get("X-Superadmin-Key") === process.env.SUPERADMIN_API_KEY;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  try {
    const [
      totalSellers,
      activeSellers,
      totalProducts,
      activeProducts,
      sells,
      topSellersRaw,
      topProductsRaw,
    ] = await Promise.all([
      prisma.seller.count(),
      prisma.seller.count({ where: { active: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.sell.findMany({ select: { total: true, status: true } }),
      prisma.seller.findMany({
        take: 5,
        include: { _count: { select: { sells: true, products: true } } },
        orderBy: { sells: { _count: "desc" } },
      }),
      prisma.product.findMany({
        take: 5,
        include: {
          _count: { select: { sellDetails: true } },
          seller: { select: { name: true } },
        },
        orderBy: { sellDetails: { _count: "desc" } },
      }),
    ]);

    const totalSells     = sells.length;
    const confirmedSells = sells.filter((s) => s.status === "CONFIRMED").length;
    const pendingSells   = sells.filter((s) => s.status === "PENDING").length;
    const cancelledSells = sells.filter((s) => s.status === "CANCELLED").length;
    const totalRevenue   = sells
      .filter((s) => s.status === "CONFIRMED")
      .reduce((acc, s) => acc + Number(s.total), 0);

    return NextResponse.json(
      {
        sellers: {
          total:    totalSellers,
          active:   activeSellers,
          inactive: totalSellers - activeSellers,
        },
        products: {
          total:    totalProducts,
          active:   activeProducts,
          inactive: totalProducts - activeProducts,
        },
        sells: {
          total:     totalSells,
          confirmed: confirmedSells,
          pending:   pendingSells,
          cancelled: cancelledSells,
        },
        revenue: {
          confirmed: totalRevenue,
        },
        topSellers: topSellersRaw.map((s) => ({
          id:            s.id,
          name:          s.name,
          email:         s.email,
          active:        s.active,
          totalSells:    s._count.sells,
          totalProducts: s._count.products,
        })),
        topProducts: topProductsRaw.map((p) => ({
          id:         p.id,
          name:       p.name,
          brand:      p.brand,
          price:      Number(p.price),
          stock:      p.stock,
          active:     p.active,
          seller:     p.seller.name,
          totalSells: p._count.sellDetails,
        })),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[GET /api/admin/summary]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500, headers: CORS_HEADERS });
  }
}