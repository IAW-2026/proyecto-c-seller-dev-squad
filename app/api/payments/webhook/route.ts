import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { sellId, status } = body;

    if (!sellId || !status) {
      return NextResponse.json(
        { error: "Datos faltantes" },
        { status: 400 }
      );
    }

    const updatedSell = await prisma.sell.update({
      where: {
        id: sellId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      ok: true,
      sell: updatedSell,
    });

  } catch (error) {
    console.error("ERROR WEBHOOK:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}