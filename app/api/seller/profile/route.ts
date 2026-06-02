import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { description } = await req.json();
    if (typeof description !== "string") {
      return NextResponse.json({ error: "Descripción inválida" }, { status: 400 });
    }

    const seller = await prisma.seller.update({
      where: { clerkUserId: userId },
      data: { description: description.trim() || null },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error("[PATCH /api/seller/profile]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}