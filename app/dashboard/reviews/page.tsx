import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MOCK_REVIEWS = [
  { id: "rev_001", sellerId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn", rating: 5, comentario: "Excelente atención y producto tal como se describía.", fecha: "2026-04-10" },
  { id: "rev_002", sellerId: "user_3DpXMEd6u89VnAWhsLtcjJc75bQ", rating: 4, comentario: "Llegó rápido y en perfectas condiciones.", fecha: "2026-04-15" },
  { id: "rev_003", sellerId: "user_3Dmn3iLVDbiXRlsplW5U4D8Nikn", rating: 5, comentario: "Muy buena experiencia de compra, recomendado.", fecha: "2026-04-22" },
  { id: "rev_004", sellerId: "user_3DpXMEd6u89VnAWhsLtcjJc75bQ", rating: 3, comentario: "El producto estaba bien pero tardó más de lo esperado.", fecha: "2026-05-01" },
  { id: "rev_005", sellerId: "user_3DpOYfSLrQPxMxBXGccpbrQ1Ahd", rating: 5, comentario: "Zapatillas increíbles, muy buena calidad.", fecha: "2026-05-03" },
];

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");

  const reviews = MOCK_REVIEWS.filter(
    (review) => review.sellerId === userId
  );

  const promedio =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Reseñas</h1>
          <p className="dashboard-topbar-date">
            {reviews.length} reseñas · promedio {Math.round(promedio * 10) / 10} ★
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: 12 }}>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 16, letterSpacing: 2 }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span className="text-faint" style={{ fontSize: 11 }}>{r.fecha}</span>
              </div>
              <p className="text-strong" style={{ fontSize: 13 }}>{r.comentario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}