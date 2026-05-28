import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    const preferred =
      saved ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");

    setTheme(preferred);

    document.documentElement.setAttribute(
      "data-theme",
      preferred
    );

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(next);

    document.documentElement.setAttribute(
      "data-theme",
      next
    );

    localStorage.setItem("theme", next);
  };

  return {
    theme,
    toggleTheme,
    mounted,
  };
}