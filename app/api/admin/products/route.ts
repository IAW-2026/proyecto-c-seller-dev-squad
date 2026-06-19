import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest) {
  const apiKey = req.headers.get("X-Superadmin-Key");
  return apiKey === process.env.SUPERADMIN_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      }))
    );
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, active } = await req.json();
    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ ok: true, active: updated.active });
  } catch (error) {
    console.error("[PATCH /api/admin/products]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}