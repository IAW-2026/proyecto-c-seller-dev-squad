// app/api/sales/[id]/route.ts
// GET   /api/sales/:id  — detalle de venta (consumido por Shipping App)
// PATCH /api/sales/:id  — actualizar estado (panel del vendedor)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface Params { params: { id: string } }

// ── GET /api/sales/:id ─────────────────────────────────────
// Consumido por Shipping App para obtener detalle de venta.
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const sell = await prisma.sell.findUnique({
      where: { id: params.id },
      include: {
        details: { include: { product: { select: { name: true, brand: true, image: true } } } },
        seller:  { select: { id: true, name: true, email: true } },
      },
    });

    if (!sell) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id:        sell.id,
      sellerId:  sell.sellerId,
      orderId:   sell.orderId,
      paymentId: sell.paymentId,
      status:    sell.status.toLowerCase(),
      total:     Number(sell.total),
      createdAt: sell.createdAt,
      seller:    sell.seller,
      items:     sell.details.map((d) => ({
        productId: d.productId,
        quantity:  d.quantity,
        price:     Number(d.unitPrice),
        size:      d.size,
        color:     d.color,
        product:   d.product,
      })),
    });
  } catch (error) {
    console.error("[GET /api/sales/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ── PATCH /api/sales/:id ────────────────────────────────────
// Privado: solo el vendedor dueño puede cambiar el estado.
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const seller = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
    if (!seller) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
    }

    const sell = await prisma.sell.findFirst({
      where: { id: params.id, sellerId: seller.id },
    });
    if (!sell) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    const { status } = await req.json();
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Estado inválido. Valores posibles: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const updated = await prisma.sell.update({
      where: { id: params.id },
      data:  { status },
    });

    return NextResponse.json({
      id:      updated.id,
      orderId: updated.orderId,
      status:  updated.status.toLowerCase(),
      total:   Number(updated.total),
    });
  } catch (error) {
    console.error("[PATCH /api/sales/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}