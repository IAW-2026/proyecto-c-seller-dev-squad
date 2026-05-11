"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main" style={{ flex: 1, marginLeft: 224 }}>
        {/* topbar mobile con hamburger */}
        <div className="mobile-topbar">
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-foreground)", letterSpacing: "-.02em" }}>
            seller<span style={{ color: "var(--color-success)" }}>.</span>
          </span>
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}