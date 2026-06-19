import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Superadmin-Key",
};

function checkAuth(req: NextRequest) {
  const apiKey = req.headers.get("X-Superadmin-Key");
  return apiKey === process.env.SUPERADMIN_API_KEY;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        seller: { select: { name: true } },
        _count: { select: { sellDetails: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      products.map((p) => ({
        id:         p.id,
        name:       p.name,
        price:      Number(p.price),
        stock:      p.stock,
        brand:      p.brand ?? "",
        active:     p.active,
        seller:     p.seller.name,
        totalSells: p._count.sellDetails,
      })),
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }

  try {
    const { id, active } = await req.json();
    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400, headers: CORS_HEADERS });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ ok: true, active: updated.active }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[PATCH /api/admin/products]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500, headers: CORS_HEADERS });
  }
}