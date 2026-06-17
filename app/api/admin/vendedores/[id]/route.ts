// PATCH /api/admin/vendedores/:id — activar/desactivar seller(solo admin)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 
    const role =
      (sessionClaims?.publicMetadata as {
        role?: string;
      })?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { active } = await req.json();
    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "El campo active debe ser booleano" }, { status: 400 });
    }
 
    const seller= await prisma.seller.update({
      where: { id: id },
      data:  { active },
    });
 
    return NextResponse.json( seller);
  } catch (error) {
    console.error("[PATCH /api/admin/vendedores/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}