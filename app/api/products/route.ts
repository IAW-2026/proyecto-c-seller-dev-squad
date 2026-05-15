// GET  /api/products  — lista productos (consumido por Buyer App)
// POST /api/products  — crea producto (consumido por el panel del vendedor)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
// ── GET /api/products ──────────────────────────────────────
// Público: la Buyer App lo consume sin autenticación de usuario.
// Soporta ?q=, ?marca=, ?page=, ?limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q      = searchParams.get("q")     ?? "";
    const marca  = searchParams.get("marca")  ?? "";
    const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
 
    const where = {
      activo: true,
      ...(marca && { marca: { equals: marca, mode: "insensitive" as const } }),
      ...(q && {
        OR: [
          { nombre:      { contains: q, mode: "insensitive" as const } },
          { marca:       { contains: q, mode: "insensitive" as const } },
          { descripcion: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };
 
    const [total, productos] = await Promise.all([
      prisma.producto.count({ where }),
      prisma.producto.findMany({
        where,
        select: {
          id:          true,
          nombre:      true,
          descripcion: true,
          precio:      true,
          stock:       true,
          marca:       true,
          imagenUrl:   true,
          vendedorId:  true,
          talles: { select: { talle: true, stock: true } },
        },
        orderBy: { creadoEn: "desc" },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
    ]);
 
    return NextResponse.json({
      data:  productos.map((p) => ({ ...p, precio: Number(p.precio) })),
      meta:  { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
 
// ── POST /api/products ─────────────────────────────────────
// Privado: solo vendedores autenticados con Clerk.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
 
    const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
    if (!vendedor) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
    }
 
    const body = await req.json();
    const { nombre, descripcion, precio, stock, marca, imagenUrl, talles } = body;
 
    // validación server-side
    if (!nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!precio || Number(precio) <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
    }
 
    const producto = await prisma.producto.create({
      data: {
        nombre:      nombre.trim(),
        descripcion: descripcion?.trim() ?? null,
        precio:      Number(precio),
        stock:       Number(stock ?? 0),
        marca:       marca ?? null,
        imagenUrl:   imagenUrl ?? null,
        vendedorId:  vendedor.id,
        talles: talles?.length
          ? { create: talles.map((t: { talle: string; stock: number }) => ({ talle: t.talle, stock: t.stock })) }
          : undefined,
      },
      include: { talles: true },
    });
 
    return NextResponse.json(
      { ...producto, precio: Number(producto.precio) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}