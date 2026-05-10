"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",          label: "Resumen",   icon: "▦" },
  { href: "/dashboard/products", label: "Productos", icon: "◫" },
  { href: "/dashboard/sales",    label: "Ventas",    icon: "◈" },
  { href: "/dashboard/admin",    label: "Admin",     icon: "◉" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: "fixed", inset: "0 auto 0 0", width: 224,
      background: "#111", display: "flex", flexDirection: "column", zIndex: 40,
    }}>
      {/* logo */}
      <div style={{ padding: "28px 22px 20px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#e8e6e0", letterSpacing: "-.03em" }}>
          seller<span style={{ color: "#c8f060" }}>.</span>
        </span>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: "10px 10px" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                fontSize: 13, textDecoration: "none",
                background: active ? "rgba(255,255,255,.1)" : "transparent",
                color: active ? "#e8e6e0" : "#9e9a92",
              }}
            >
              <span style={{ fontSize: 15, opacity: .7 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* usuario */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", gap: 10 }}>
        <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#e8e6e0" }}>Mi cuenta</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Vendedor</p>
        </div>
      </div>
    </aside>
  );
}