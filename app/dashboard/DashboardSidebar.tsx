"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/hooks/ThemeProvider";

const NAV = [
  { href: "/dashboard",          label: "Resumen",   icon: "▦" },
  { href: "/dashboard/products", label: "Productos", icon: "◫" },
  { href: "/dashboard/sales",    label: "Ventas",    icon: "◈" },
  { href: "/dashboard/reviews",  label: "Reseñas",   icon: "★" },
  { href: "/dashboard/profile",  label: "Mi perfil", icon: "◎" },
  { href: "/dashboard/admin",    label: "Admin",     icon: "◉" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  role: string;
}

export default function DashboardSidebar({ open, onClose, role }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  //const { user } = useUser();
  //const name = user?.fullName ||"Mi cuenta";
  const name = "Mi cuenta";
  const NAV_FILTRADO = NAV.filter(item => {
  if (item.href === "/dashboard/admin") return role === "admin";
  if (role === "admin") return item.href === "/dashboard/admin";
  return true;
});

  if (!mounted) {
    return null;
  } 
  

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
            src={theme === "dark" ? "/logo-dark.webp" : "/logo-light.webp"}
            alt="Seller"
            width={966}
            height={326}
            priority
            loading="eager"
            className="sidebar-logo-image"
          />
        </div>
        <nav className="sidebar-nav">
          {NAV_FILTRADO.map((item) => {
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
            <p className="sidebar-user-name">{name}</p>
            <p className="sidebar-user-role">{role === "admin" ? "Administrador" : "Vendedor"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}