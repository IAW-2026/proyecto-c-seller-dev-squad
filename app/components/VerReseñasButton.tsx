"use client";

import { getSellerReviewsUrl } from "@/lib/actions/Handoff.actions";
import { useTheme } from "@/hooks/ThemeProvider";

export default function VerResenasButton() {
  const { theme } = useTheme();

  const handleClick = async () => {
    const url = await getSellerReviewsUrl(theme);
    alert(url);
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