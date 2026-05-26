import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MOCK_REVIEWS = [
  { id: "rev_001", rating: 5, comentario: "Excelente atención y producto tal como se describía.", fecha: "2026-04-10" },
  { id: "rev_002", rating: 4, comentario: "Llegó rápido y en perfectas condiciones.", fecha: "2026-04-15" },
  { id: "rev_003", rating: 5, comentario: "Muy buena experiencia de compra, recomendado.", fecha: "2026-04-22" },
  { id: "rev_004", rating: 3, comentario: "El producto estaba bien pero tardó más de lo esperado.", fecha: "2026-05-01" },
  { id: "rev_005", rating: 5, comentario: "Zapatillas increíbles, muy buena calidad.", fecha: "2026-05-03" },
];

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");

  const promedio = MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / MOCK_REVIEWS.length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Reseñas</h1>
          <p className="dashboard-topbar-date">
            {MOCK_REVIEWS.length} reseñas · promedio {Math.round(promedio * 10) / 10} ★
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        {MOCK_REVIEWS.map((r) => (
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