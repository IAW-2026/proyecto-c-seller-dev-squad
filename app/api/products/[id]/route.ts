// GET   /api/products/:id  — detalle de producto (consumido por Buyer App)
// PATCH /api/products/:id  — actualizar producto (panel del vendedor)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
interface Params { params:  Promise<{ id: string }>}
 
// ── GET /api/products/:id ──────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
const { id } = await params; 
  try {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        talles:   { select: { talle: true, stock: true } },
        vendedor: { select: { id: true, nombre: true, email: true } },
      },
    });
 
    if (!producto || !producto.activo) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
 
    return NextResponse.json({ ...producto, precio: Number(producto.precio) });
  } catch (error) {
    console.error("[GET /api/products/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
 
// ── PATCH /api/products/:id ────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params; 
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
 
    const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
    if (!vendedor) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
    }
 
    // verificar que el producto pertenece a este vendedor
    const existente = await prisma.producto.findFirst({
      where: { id, vendedorId: vendedor.id },
    });
    if (!existente) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
 
    const body = await req.json();
    const { nombre, descripcion, precio, stock, marca, imagenUrl, activo, talles } = body;
 
    // actualizar talles si vienen en el body
    if (talles !== undefined) {
      await prisma.productoTalle.deleteMany({ where: { productoId: id } });
      if (talles.length > 0) {
        await prisma.productoTalle.createMany({
          data: talles.map((t: { talle: string; stock: number }) => ({
            productoId: id,
            talle:      t.talle,
            stock:      t.stock,
          })),
        });
      }
    }
 
    const actualizado = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre      !== undefined && { nombre:      nombre.trim() }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() ?? null }),
        ...(precio      !== undefined && { precio:      Number(precio) }),
        ...(stock       !== undefined && { stock:       Number(stock) }),
        ...(marca       !== undefined && { marca }),
        ...(imagenUrl   !== undefined && { imagenUrl }),
        ...(activo      !== undefined && { activo }),
      },
      include: { talles: true },
    });
 
    return NextResponse.json({ ...actualizado, precio: Number(actualizado.precio) });
  } catch (error) {
    console.error("[PATCH /api/products/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}