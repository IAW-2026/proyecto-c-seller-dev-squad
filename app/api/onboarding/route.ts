import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const {  name, email, description } = await req.json();

    if (! name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: " name y email son obligatorios" }, { status: 400 });
    }

    // verificar que no exista ya
    const existente = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
    if (existente) return NextResponse.json({ error: "Ya tenés un perfil de  seller" }, { status: 409 });

    const seller= await prisma.seller.create({
      data: {
        clerkUserId: userId,
         name:       name.trim(),
        email:       email.trim(),
        description: description?.trim(),
         avatarUrl: "",
      },
    });

    return NextResponse.json( seller, { status: 201 });
  } catch (error) {
    console.error("[POST /api/onboarding]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}