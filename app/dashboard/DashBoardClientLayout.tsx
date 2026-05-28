"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main" style={{ flex: 1, marginLeft: 224 }}>

        {/* topbar mobile — una sola barra */}
        <div className="mobile-topbar">
          <Image
            src={theme === "dark" ? "/logo-dark.webp" : "/logo-light.webp"}
            alt="Seller"
            width={966}
            height={326}
            priority
            loading="eager"
            className="mobile-logo-image"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}