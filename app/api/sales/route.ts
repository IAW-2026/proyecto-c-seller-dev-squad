// app/api/sales/route.ts
// POST /api/sales — registrar venta (llamado por Payments App tras confirmar pago)
// GET  /api/sales — listar ventas (vendedor ve las suyas; admin/llamadas internas ven todas)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const BUYER_APP_URL    = process.env.BUYER_APP_URL ?? "";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

// ── helper: validar llamadas internas entre apps ─────────────
// Otras apps (Payments, herramientas de admin, etc.) deben mandar
// el header `x-internal-api-key` con el mismo valor que INTERNAL_API_KEY.
function isAuthorizedInternalRequest(req: NextRequest): boolean {
  if (!INTERNAL_API_KEY) return false; // si no está configurada, nunca se acepta por key
  const key = req.headers.get("x-internal-api-key");
  return key === INTERNAL_API_KEY;
}

interface BuyerOrderItem {
  productId: string;
  name?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}
interface BuyerOrder {
  id: string;
  items: BuyerOrderItem[];
  total: number;
}

// ── helper: traer los items de la orden desde la Buyer App ──
// Se usa cuando Payments no manda el array `items` en el payload.
async function fetchOrderItemsFromBuyerApp(orderId: string): Promise<BuyerOrderItem[] | null> {
  if (!BUYER_APP_URL) return null;
  try {
    const res = await fetch(`${BUYER_APP_URL}/orders/${orderId}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const order: BuyerOrder = await res.json();
    return order.items ?? null;
  } catch (err) {
    console.warn("[POST /api/sales] No se pudo obtener la orden desde Buyer App:", err);
    return null;
  }
}

// ── POST /api/sales ────────────────────────────────────────
// Endpoint inter-app: requiere el header x-internal-api-key.
// Payload esperado (mínimo): { orderId, sellerId, total, paymentId? }
// `items` es opcional: si no viene, se busca en la Buyer App por orderId.
export async function POST(req: NextRequest) {
  if (!isAuthorizedInternalRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, sellerId, total, paymentId } = body;
    let items = body.items as { productId: string; quantity: number; price: number; size?: string; color?: string }[] | undefined;

    if (!orderId || !sellerId || total === undefined || total === null) {
      return NextResponse.json({ error: "Faltan campos obligatorios: orderId, sellerId, total" }, { status: 400 });
    }

    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
    }

    // idempotente: si la orden ya fue registrada, devolvemos la venta existente
    const sellExistente = await prisma.sell.findUnique({ where: { orderId } });
    if (sellExistente) {
      return NextResponse.json(sellExistente, { status: 200 });
    }

    // si no vinieron items en el payload, los buscamos en la Buyer App
    if (!items?.length) {
      const itemsDesdeOrden = await fetchOrderItemsFromBuyerApp(orderId);
      if (itemsDesdeOrden?.length) {
        items = itemsDesdeOrden.map((i) => ({
          productId: i.productId,
          quantity:  i.quantity,
          price:     i.price,
          size:      i.size,
          color:     i.color,
        }));
      }
    }

    // filtramos para quedarnos solo con productos que pertenecen a ESTE vendedor
    // (una orden de marketplace puede incluir productos de varios vendedores)
    let detailsData: { productId: string; quantity: number; unitPrice: number; size?: string; color?: string }[] = [];

    if (items?.length) {
      const productIds = items.map((i) => i.productId).filter(Boolean);
      const ownProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, sellerId: seller.id },
        select: { id: true },
      });
      const ownIds = new Set(ownProducts.map((p) => p.id));

      detailsData = items
        .filter((i) => ownIds.has(i.productId))
        .map((i) => ({
          productId: i.productId,
          quantity:  i.quantity,
          unitPrice: Number(i.price),
          size:      i.size,
          color:     i.color,
        }));
    }

    const sell = await prisma.sell.create({
      data: {
        orderId,
        paymentId: paymentId ?? null,
        total:     Number(total),
        status:    "CONFIRMED",
        sellerId:  seller.id,
        details: detailsData.length ? { create: detailsData } : undefined,
      },
      include: {
        details: { include: { product: { select: { name: true, brand: true } } } },
      },
    });

    return NextResponse.json(
      {
        id:        sell.id,
        sellerId:  sell.sellerId,
        orderId:   sell.orderId,
        status:    sell.status.toLowerCase(),
        total:     Number(sell.total),
        paymentId: sell.paymentId,
        items:     sell.details.map((d) => ({
          productId: d.productId,
          quantity:  d.quantity,
          price:     Number(d.unitPrice),
          size:      d.size,
          color:     d.color,
          name:      d.product.name,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/sales]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ── GET /api/sales ─────────────────────────────────────────
// Tres formas de acceso:
//  1. Llamada interna con x-internal-api-key → ve todas las ventas
//     (o filtra por ?sellerId= si se especifica).
//  2. Vendedor autenticado con Clerk → ve solo sus propias ventas.
//  3. Vendedor autenticado con rol "admin" → ve todas las ventas
//     (mismo comportamiento que la llamada interna).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status        = searchParams.get("status") ?? undefined;
    const page           = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit           = Math.min(50, Number(searchParams.get("limit") ?? "10"));
    const sellerIdParam  = searchParams.get("sellerId") ?? undefined;

    let sellerIdFiltro: string | undefined;

    if (isAuthorizedInternalRequest(req)) {
      // acceso interno/admin externo: todas las ventas, o filtradas por sellerId
      sellerIdFiltro = sellerIdParam;
    } else {
      const { userId, sessionClaims } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      const seller = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
      if (!seller) {
        return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
      }

      // TODO: ajustar la key/valor según lo que confirme el equipo sobre roles en el JWT
      const role = (sessionClaims?.metadata as any)?.role
                ?? (sessionClaims?.publicMetadata as any)?.role
                ?? (sessionClaims as any)?.role
                ?? null;

      // admin ve todas las ventas (o filtra por sellerId); vendedor normal solo ve las suyas
      sellerIdFiltro = role === "admin" ? sellerIdParam : seller.id;
    }

    const where = {
      ...(sellerIdFiltro && { sellerId: sellerIdFiltro }),
      ...(status && { status: status.toUpperCase() as "PENDING" | "CONFIRMED" | "CANCELLED" }),
    };

    const [total, sells] = await Promise.all([
      prisma.sell.count({ where }),
      prisma.sell.findMany({
        where,
        include: { details: { include: { product: { select: { name: true, brand: true } } } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: sells.map((s) => ({
        id:        s.id,
        sellerId:  s.sellerId,
        orderId:   s.orderId,
        status:    s.status.toLowerCase(),
        total:     Number(s.total),
        createdAt: s.createdAt,
        items:     s.details.map((d) => ({
          productId: d.productId,
          quantity:  d.quantity,
          price:     Number(d.unitPrice),
          name:      d.product.name,
        })),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/sales]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}