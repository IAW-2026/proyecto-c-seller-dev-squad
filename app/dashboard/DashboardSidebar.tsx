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
    <aside className="sidebar">
      <div className="sidebar-logo">
        seller<span className="sidebar-logo-dot">.</span>
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
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
        <div>
          <p className="sidebar-user-name">Mi cuenta</p>
          <p className="sidebar-user-role">Vendedor</p>
        </div>
      </div>
    </aside>
  );
}