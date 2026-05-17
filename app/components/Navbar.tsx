"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <Link href="/">
        <div className="navbar-logo-wrapper">
          <Image
            src="/logo-light.webp"
            alt="ZapasYa"
            width={966}
            height={326}
            priority
            className="navbar-logo logo-light"
          />

          <Image
            src="/logo-dark.webp"
            alt="ZapasYa"
            width={966}
            height={326}
            priority
            className="navbar-logo logo-dark"
          />
        </div>
  </Link>
      <button  onClick={toggleTheme}
        aria-label="Toggle theme"
        className="theme-toggle">

        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </header>
  );
}