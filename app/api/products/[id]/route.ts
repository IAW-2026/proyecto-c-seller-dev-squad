// GET   /api/products/:id  — desize de  product (consumido por Buyer App)
// PATCH /api/products/:id  — actualizar  product (panel del  seller)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
interface Params { params:  Promise<{ id: string }>}
 
// ── GET /api/products/:id ──────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
const { id } = await params; 
  try {
    const  product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes:   { select: { size: true, stock: true } },
         seller: { select: { id: true,  name: true, email: true } },
      },
    });
 
    if (!product || !product.active) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
 
    return NextResponse.json({ ... product, price: Number( product.price) });
  } catch (error) {
    console.error("[GET /api/products/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
 
// ── PATCH /api/products/:id ────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const { userId, sessionClaims } = await auth();
    const effectiveUserId =
        await getEffectiveUserId();
      
  
    if (!effectiveUserId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const role =
      (sessionClaims?.metadata as any)?.role ??
      (sessionClaims?.publicMetadata as any)?.role ??
      null;

    const isAdmin = role === "admin";

    if (!isAdmin) {
      const seller = await prisma.seller.findUnique({ where: { clerkUserId: effectiveUserId } });
      if (!seller) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });

      const existente = await prisma.product.findFirst({
        where: { id, sellerId: seller.id },
      });
      if (!existente) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // buscar el producto para obtener stock actual (disponible para todos)
    const producto = await prisma.product.findUnique({ where: { id } });
    if (!producto) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const body = await req.json();
    const { name, description, price, stock, brand, category, image, direction, colors, active, sizes } = body;

    const stockTotal =
      sizes?.length > 0
        ? sizes.reduce((acc: number, s: { stock: number }) => acc + Number(s.stock || 0), 0)
        : Number(stock ?? producto.stock); // ← usa producto en vez de existente

    // actualizar sizes si vienen en el body
    if (sizes !== undefined) {
      await prisma.productSize.deleteMany({ where: { productId: id } });
      if (sizes.length > 0) {
        await prisma.productSize.createMany({
          data: sizes.map((t: { size: string; stock: number }) => ({
            productId: id,
            size: t.size,
            stock: t.stock,
          })),
        });
      }
    }

    const updatedAt = await prisma.product.update({
      where: { id },
      data: {
        ...(name        !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() ?? null }),
        ...(price       !== undefined && { price: Number(price) }),
        ...(stock !== undefined || sizes !== undefined ? { stock: stockTotal } : {}),
        ...(brand       !== undefined && { brand }),
        ...(category    !== undefined && { category }),
        ...(image       !== undefined && { image: image?.trim() || null }),
        ...(direction   !== undefined && { direction: direction?.trim() || null }),
        ...(colors      !== undefined && { colors }),
        ...(active      !== undefined && { active }),
      },
      include: { sizes: true },
    });

    return NextResponse.json({ ...updatedAt, price: Number(updatedAt.price) });
  } catch (error) {
    console.error("[PATCH /api/products/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}