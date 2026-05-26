// app/api/reviews/route.ts
// GET /api/reviews?sellerId=...
// Consume la Feedback App para obtener reseñas del vendedor.
 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
 
const FEEDBACK_APP_URL = process.env.FEEDBACK_APP_URL ?? "";
 
const MOCK_REVIEWS = [
  { id: "rev_001", rating: 5, comentario: "Excelente atención y producto tal como se describía.", fecha: "2026-04-10", userId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn" },
  { id: "rev_002", rating: 4, comentario: "Llegó rápido y en perfectas condiciones.", fecha: "2026-04-15", userId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn" },
  { id: "rev_003", rating: 5, comentario: "Muy buena experiencia de compra, recomendado.", fecha: "2026-04-22", userId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn" },
  { id: "rev_004", rating: 3, comentario: "El producto estaba bien pero tardó más de lo esperado.", fecha: "2026-05-01", userId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn" },
  { id: "rev_005", rating: 5, comentario: "Zapatillas increíbles, muy buena calidad.", fecha: "2026-05-03", userId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn" },
];
 
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
 
    const vendedor = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
    if (!vendedor) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 403 });
    }
 
    // intentar consumir la Feedback App real
    if (FEEDBACK_APP_URL) {
      try {
        const res = await fetch(`${FEEDBACK_APP_URL}/reviews/seller/${vendedor.id}`, {
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 60 }, // cache 60 segundos
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // si falla la Feedback App, caemos al mock
        console.warn("[GET /api/reviews] Feedback App no disponible, usando mock");
      }
    }
 
    // fallback: datos mockeados 
    const promedio = MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / MOCK_REVIEWS.length;
 
    return NextResponse.json({
      sellerId: vendedor.id,
      reviews:  MOCK_REVIEWS,
      stats: {
        total:    MOCK_REVIEWS.length,
        promedio: Math.round(promedio * 10) / 10,
      },
      source: FEEDBACK_APP_URL ? "feedback-app" : "mock",
    });
  } catch (error) {
    console.error("[GET /api/reviews]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
 