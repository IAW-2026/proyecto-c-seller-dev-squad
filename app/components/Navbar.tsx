"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <Link href="/">
        <Image
          src={theme === "dark"
            ? "/logo-dark.png"
            : "/logo-light.png"}
          alt="ZapasYa"
          width={160}
          height={50}
          priority
          className="navbar-logo"
        />
      </Link>

      <button  onClick={toggleTheme}
        aria-label="Toggle theme"
        className="theme-toggle">

        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </header>
  );
}