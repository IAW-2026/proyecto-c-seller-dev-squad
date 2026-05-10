"use client";

import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 border-b"
      style={{ 
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)"
      }}
    >
      <span className="font-semibold text-sm">Seller App</span>

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="p-2 rounded-md transition-colors"
        style={{ color: "var(--color-muted)" }}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}