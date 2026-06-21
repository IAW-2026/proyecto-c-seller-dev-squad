"use client";

import { getSellerReviewsUrl } from "@/lib/actions/Handoff.actions";

export default function VerResenasButton() {
  const handleClick = async () => {
    const url = await getSellerReviewsUrl();

    window.location.href = url;
  };

  return (
    <button
      onClick={handleClick}
      className="btn-primary"
    >
      Ver todas las reseñas
    </button>
  );
}