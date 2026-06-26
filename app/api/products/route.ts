// GET  /api/products  — lista  products (consumido por Buyer App)
// POST /api/products  — crea  product (consumido por el panel del  seller)
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {getEffectiveUserId} from "@/lib/getEffectiveUser";

 
// ── GET /api/products ──────────────────────────────────────
// Público: la Buyer App lo consume sin autenticación de usuario.
// Soporta ?q=, ?brand=, ?page=, ?limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q      = searchParams.get("q")     ?? "";
    const brand  = searchParams.get("brand")  ?? "";
    const category = searchParams.get("category") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
 
    const where = {
      active: true,
      ...(brand && { brand: { equals: brand, mode: "insensitive" as const } }),
      ...(category && { category: { equals: category, mode: "insensitive" as const } }),
      ...(q && {
        OR: [
          {  name:      { contains: q, mode: "insensitive" as const } },
          { brand:       { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };
 
    const [total,  products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id:          true,
          name:      true,
          description: true,
          price:      true,
          stock:       true,
          brand:       true,
          category:    true,
          image:   true,
          direction: true,
          colors: true,
          sellerId:  true,
          sizes: { select: { size: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
    ]);
 
    return NextResponse.json({
      data:   products.map((p) => ({ ...p, price: Number(p.price) })),
      meta:  { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
 
// ── POST /api/products ─────────────────────────────────────
// Privado: solo  sellers autenticados con Clerk.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    const effectiveUserId =
        await getEffectiveUserId();
      
    if (!effectiveUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
 
    const seller= await prisma.seller.findUnique({ where: { clerkUserId: effectiveUserId } });
    if (!seller) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
    }
 
    const body = await req.json();
    const {  name, description, price, stock, brand, category, image, direction, colors, sizes } = body;

    const stockTotal =
      sizes?.length > 0
        ? sizes.reduce(
            (acc: number, s: { stock: number }) =>
              acc + Number(s.stock || 0),
            0
          )
        : Number(stock ?? 0);
 
    // validación server-side
    if (!name?.trim()) {
      return NextResponse.json({ error: "El  nombre es obligatorio" }, { status: 400 });
    }
    if (!price || Number(price) <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
    }
 
    const  product = await prisma.product.create({
      data: {
        name:       name.trim(),
        description: description?.trim() ?? null,
        price:      Number(price),
        stock:       stockTotal,
        brand:       brand ?? null,
        category:    category ?? null,
        image:      image ?? null,
        direction: direction?.trim() || null,
        colors: colors ?? [],
        sellerId:   seller.id,
        sizes: sizes?.length
          ? { create: sizes.map((t: { size: string; stock: number }) => ({ size: t.size, stock: t.stock })) }
          : undefined,
      },
      include: { sizes: true },
    });
 
    return NextResponse.json(
      { ... product, price: Number( product.price) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}