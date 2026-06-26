"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/ThemeProvider";

export default function Navbar() {
const { theme, toggleTheme, mounted } = useTheme();

if (!mounted) {
  return null;
}

  return (
    <header className="navbar">
      <Link href="/">
        <Image
          src={theme === "dark"
            ? "/logo-dark.webp"
            : "/logo-light.webp"}
          alt="ZapasYa"
          width={966}
          height={326}
          priority
          loading="eager"
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