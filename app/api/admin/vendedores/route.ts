import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Superadmin-Key",
};

function checkSuperadmin(req: NextRequest) {
  return req.headers.get("X-Superadmin-Key") === process.env.SUPERADMIN_API_KEY;
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  if (!checkSuperadmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sellers = await prisma.seller.findMany({
      include: { _count: { select: { products: true, sells: true } } },
      orderBy: { createdAt: "desc" },
    });

    const res = NextResponse.json(
      sellers.map((s) => ({
        id:            s.id,
        name:          s.name,
        email:         s.email,
        description:   s.description,
        active:        s.active,
        createdAt:     s.createdAt.toISOString(),
        totalProducts: s._count.products,
        totalSells:    s._count.sells,
      }))
    );
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (error) {
    console.error("[GET /api/admin/vendedores]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkSuperadmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, active } = await req.json();
    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const seller = await prisma.seller.update({
      where: { id },
      data: { active },
    });

    const res = NextResponse.json({ ok: true, active: seller.active });
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (error) {
    console.error("[PATCH /api/admin/vendedores]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}