// PATCH /api/admin/vendedores/:id — activar/desactivar vendedor (solo admin)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
interface Params { params: { id: string } }
 
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 
 
    const { activo } = await req.json();
    if (typeof activo !== "boolean") {
      return NextResponse.json({ error: "El campo activo debe ser booleano" }, { status: 400 });
    }
 
    const vendedor = await prisma.vendedor.update({
      where: { id: params.id },
      data:  { activo },
    });
 
    return NextResponse.json(vendedor);
  } catch (error) {
    console.error("[PATCH /api/admin/vendedores/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}