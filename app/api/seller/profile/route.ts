import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export async function PATCH(req: NextRequest) {
  try {
    const effectiveUserId = await getEffectiveUserId();

    if (!effectiveUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { description, avatarUrl } = await req.json();

    if (typeof description !== "string") {
      return NextResponse.json({ error: "Descripción inválida" }, { status: 400 });
    }

    if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Avatar URL inválida" }, { status: 400 });
    }

    const seller = await prisma.seller.update({
      where: { clerkUserId: effectiveUserId },
      data: {
        description: description.trim() || null,
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
      },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.error("[PATCH /api/seller/profile]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}