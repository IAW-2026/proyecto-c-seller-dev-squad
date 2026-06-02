// app/api/reviews/route.ts
// GET /api/reviews?sellerId=...
// Consume la Feedback App para obtener reseñas del vendedor.
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
const FEEDBACK_APP_URL = process.env.FEEDBACK_APP_URL ?? "";
 
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const vendedor = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });

  if (!FEEDBACK_APP_URL) {
    return NextResponse.json({ error: "Feedback App no configurada" }, { status: 503 });
  }

  const res = await fetch(`${FEEDBACK_APP_URL}/reviews/seller/${vendedor.id}` ,
  { headers: {  "X-API-Key": process.env.INTERNAL_API_KEY!, }, });
  const data = await res.json();
  return NextResponse.json(data);
}
 