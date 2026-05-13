"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard",          label: "Resumen",   icon: "▦" },
  { href: "/dashboard/products", label: "Productos", icon: "◫" },
  { href: "/dashboard/sales",    label: "Ventas",    icon: "◈" },
  { href: "/dashboard/admin",    label: "Admin",     icon: "◉" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [nombre, setNombre] = useState("Mi cuenta");

  useEffect(() => {
   async function loadUser() {
      try {
        const res = await fetch("/api/me");

       if (!res.ok) return;

        const data = await res.json();

         if (data?.nombre) {
           setNombre(data.nombre);
         }
        } catch (err) {
      console.error(err);
     }
    }

  loadUser();
}, []);
  return (
    <>
      {/* overlay mobile */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
         <Image
           src="/logo-light.png"
           alt="Seller"
           width={2500}
           height={2100}
           className="logo-light"
           priority
           style={{ width: "100%", height: "auto" }}         
            />
          <Image
            src="/logo-dark.png"
            alt="Seller"
            width={2500}
            height={2100}
            className="logo-dark"
            priority
            style={{ width: "100%", height: "auto" }}
           />
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const active = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                onClick={onClose}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* toggle de tema — desktop */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--color-muted)", width: "100%",
              padding: "6px 0",
            }}
          >
            <span style={{ fontSize: 16 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>

        <div className="sidebar-user">
          <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
          <div>
            <p className="sidebar-user-name">{nombre}</p>
            <p className="sidebar-user-role">Vendedor</p>
          </div>
        </div>
      </aside>
    </>
  );
}