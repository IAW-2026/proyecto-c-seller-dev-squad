import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Superadmin-Key",
};

function checkAuth(req: NextRequest) {
  const apiKey = req.headers.get("X-Superadmin-Key");
  return apiKey === process.env.SUPERADMIN_API_KEY;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const { id } = await params;
    const { active } = await req.json();

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "El campo active debe ser booleano" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const seller = await prisma.seller.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json(
      {
        ok: true,
        active: seller.active,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[PATCH /api/admin/vendedores/:id]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}