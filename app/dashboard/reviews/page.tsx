import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VerResenasButton from "../../components/VerReseñasButton";
import { getEffectiveUserId } from "@/lib/getEffectiveUser";

export default async function ReviewsPage() {
  const { userId } = await auth();

  const effectiveUserId =
    await getEffectiveUserId();
  
    if (!effectiveUserId) {
      redirect("/sign-in");
    }

  const vendedor = await prisma.seller.findUnique({
    where: {
      clerkUserId: effectiveUserId,
    },
  });

  if (!vendedor) {
    redirect("/dashboard");
  }

  const feedbackUrl = process.env.FEEDBACK_APP_URL!;

  let reviews: any[] = [];

  try {
    const res = await fetch(
    `${feedbackUrl}/api/reviews/seller/${vendedor.id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_SELLER_APP}`,
      },
      cache: "no-store",
    }
  );

    if (res.ok) {
      const result = await res.json();
      reviews = result.data ?? [];
    }
  } catch (error) {
    console.error(
      "[REVIEWS_PAGE] Error obteniendo reseñas:",
      error
    );
  }

  const promedio =
    reviews.length > 0
      ? reviews.reduce(
          (acc, review) => acc + review.rating,
          0
        ) / reviews.length
      : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">
            Reseñas
          </h1>

          <p className="dashboard-topbar-date">
            {reviews.length} reseñas · promedio{" "}
            {promedio.toFixed(1)} ★
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        {reviews.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <p>No hay reseñas disponibles.</p>
            </div>
          </div>
        ) : (
          reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              className="card"
              style={{ marginBottom: 12 }}
            >
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      letterSpacing: 2,
                    }}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>

                  <span
                    className="text-faint"
                    style={{ fontSize: 11 }}
                  >
                    {new Date(
                      review.fecha
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {review.userName}
                </p>

                <p>{review.comentario}</p>
              </div>
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <VerResenasButton />
        </div>
      </div>
    </div>
  );
}
           