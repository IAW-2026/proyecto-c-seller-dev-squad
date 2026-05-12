import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { nombre, email, descripcion } = await req.json();

    if (!nombre?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
    }

    // verificar que no exista ya
    const existente = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
    if (existente) return NextResponse.json({ error: "Ya tenés un perfil de vendedor" }, { status: 409 });

    const vendedor = await prisma.vendedor.create({
      data: {
        clerkUserId: userId,
        nombre:      nombre.trim(),
        email:       email.trim(),
        descripcion: descripcion?.trim() ?? null,
      },
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    console.error("[POST /api/onboarding]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}