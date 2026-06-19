import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Superadmin-Key",
};

function checkSuperadmin(req: NextRequest) {
  const apiKey = req.headers.get("X-Superadmin-Key");
  return apiKey === process.env.SUPERADMIN_API_KEY;
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
      include: {
        _count: { select: { products: true, sells: true } },
      },
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

export async function PATCH(req: NextRequest, { params }: { params?: Promise<{ id: string }> }) {
  // Superadmin con API key
  if (checkSuperadmin(req)) {
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
      console.error("[PATCH /api/admin/vendedores superadmin]", error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }

  // Admin interno con Clerk
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const role =
      (sessionClaims?.metadata as any)?.role ??
      (sessionClaims?.publicMetadata as any)?.role ??
      null;

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Para el admin interno el id viene en la URL
    const { id } = await params!;
    const { active } = await req.json();

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "El campo active debe ser booleano" }, { status: 400 });
    }

    const seller = await prisma.seller.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error("[PATCH /api/admin/vendedores/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}