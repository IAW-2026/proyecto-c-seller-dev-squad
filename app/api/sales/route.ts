import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, size, color } = body;

    if (!productId) return NextResponse.json({ error: "Falta productId" }, { status: 400 });
    if (!quantity || quantity <= 0) return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true, sizes: true },
    });

    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    if (!product.active) return NextResponse.json({ error: "Producto inactivo" }, { status: 400 });
    if (product.sizes.length > 0 && !size) return NextResponse.json({ error: "Debe seleccionar un talle" }, { status: 400 });

    let selectedSize = null;

    if (product.sizes.length > 0) {
      selectedSize = product.sizes.find((s) => s.size === size);
      if (!selectedSize) return NextResponse.json({ error: "Talle inexistente" }, { status: 400 });
      if (selectedSize.stock < quantity) return NextResponse.json({ error: "Stock insuficiente para ese talle" }, { status: 400 });
    } else {
      if (product.stock < quantity) return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
    }

    const total = Number(product.price) * quantity;

    const sells = await prisma.sell.findMany({ select: { orderId: true } });
    const numbers = sells.map((s) => { const match = s.orderId.match(/\d+/); return match ? Number(match[0]) : 0; });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const orderId = `BUYER-ORDER-${String(maxNumber + 1).padStart(3, "0")}`;

    const sell = await prisma.sell.create({
      data: {
        orderId,
        total,
        status: "PENDING",
        sellerId: product.sellerId,
        details: {
          create: {
            quantity,
            unitPrice: product.price,
            size: size ?? null,
            color: color ?? null,
            productId: product.id,
          },
        },
      },
      include: { details: true },
    });

    // ── descuenta stock ──────────────────────────────────
    if (selectedSize) {
      await prisma.productSize.update({
        where: { id: selectedSize.id },
        data: { stock: { decrement: quantity } },
      });
      const updatedSizes = await prisma.productSize.findMany({ where: { productId: product.id } });
      const totalStock = updatedSizes.reduce((acc, s) => acc + s.stock, 0);
      await prisma.product.update({ where: { id: product.id }, data: { stock: totalStock } });
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: quantity } },
      });
    }

    // ── llama al webhook ─────────────────────────────────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    try {
      const webhookRes = await fetch(
        `${baseUrl}/api/payments/webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.INTERNAL_API_KEY!,
            "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET!,
          },
          body: JSON.stringify({
            sellId: sell.id,
            status: Math.random() > 0.5 ? "CONFIRMED" : "CANCELLED",
          }),
        }
      );
    } catch (err) {
      console.error("[SALES] Webhook error:", err);
    }

    return NextResponse.json(sell, { status: 201 });

  } catch (error) {
    console.error("[SALES ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}