"use client";
// app/dashboard/DashboardClient.tsx

import { useState } from "react";
import Link from "next/link";

// ── tipos ──────────────────────────────────────────────────
type EstadoVenta = "CONFIRMADO" | "PENDIENTE" | "CANCELADO";

interface Props {
  vendedor: { nombre: string; email: string };
  metricas: {
    totalProductos: number;
    totalVentas: number;
    ingresoTotal: number;
    ventasPorEstado: Record<EstadoVenta, number>;
  };
  ventasRecientes: {
    id: string;
    ordenId: string;
    total: number;
    estado: EstadoVenta;
    creadoEn: string;
    items: number;
  }[];
  productosBajoStock: {
    id: string;
    nombre: string;
    stock: number;
    marca: string;
  }[];
}

// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

const ESTADO_STYLES: Record<EstadoVenta, { bg: string; text: string; dot: string; label: string }> = {
  CONFIRMADO: { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500", label: "Confirmado" },
  PENDIENTE:  { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400",   label: "Pendiente"  },
  CANCELADO:  { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-400",     label: "Cancelado"  },
};

// ── componente badge ───────────────────────────────────────
function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  const s = ESTADO_STYLES[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── nav lateral ────────────────────────────────────────────
const NAV = [
  { href: "/dashboard",          label: "Resumen",    icon: "▦" },
  { href: "/dashboard/products", label: "Productos",  icon: "◫" },
  { href: "/dashboard/sales",    label: "Ventas",     icon: "◈" },
  { href: "/dashboard/admin",    label: "Admin",      icon: "◉" },
];

// ── componente principal ───────────────────────────────────
export default function DashboardClient({
  vendedor,
  metricas,
  ventasRecientes,
  productosBajoStock,
}: Props) {
  const [navOpen, setNavOpen] = useState(false);

  const { totalProductos, totalVentas, ingresoTotal, ventasPorEstado } = metricas;

  // barra de progreso de estados
  const totalEstados = Object.values(ventasPorEstado).reduce((a, b) => a + b, 0) || 1;
  const pctConf = (ventasPorEstado.CONFIRMADO / totalEstados) * 100;
  const pctPend = (ventasPorEstado.PENDIENTE  / totalEstados) * 100;
  const pctCanc = (ventasPorEstado.CANCELADO  / totalEstados) * 100;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f6f5f3" }}>

      {/* ── sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 flex flex-col transition-transform duration-200
          ${navOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "#111", color: "#e8e6e0" }}
      >
        {/* logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <span className="text-lg font-semibold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            seller<span style={{ color: "#c8f060" }}>.</span>
          </span>
          <p className="text-xs mt-1 opacity-40 truncate">{vendedor.email}</p>
        </div>

        {/* nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/10"
              style={{ color: "#c8c4bc" }}
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* vendedor info */}
        <div className="px-5 py-5 border-t border-white/10">
          <p className="text-xs font-medium truncate" style={{ color: "#e8e6e0" }}>{vendedor.nombre}</p>
          <p className="text-xs opacity-40 mt-0.5">Vendedor</p>
        </div>
      </aside>

      {/* overlay mobile */}
      {navOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} />
      )}

      {/* ── main ── */}
      <main className="flex-1 lg:ml-56 min-h-screen">

        {/* topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#f6f5f3]">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-stone-200 transition-colors"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="block w-4 h-0.5 bg-stone-700 mb-1" />
              <span className="block w-4 h-0.5 bg-stone-700 mb-1" />
              <span className="block w-3 h-0.5 bg-stone-700" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-stone-900" style={{ letterSpacing: "-0.02em" }}>
                Resumen
              </h1>
              <p className="text-xs text-stone-400 hidden sm:block">
                {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "#111", color: "#c8f060" }}
          >
            <span className="text-base leading-none">+</span>
            Nuevo producto
          </Link>
        </header>

        <div className="px-6 py-8 max-w-5xl">

          {/* ── KPIs ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Ingresos confirmados", value: fmt(ingresoTotal), sub: "en ventas completadas" },
              { label: "Ventas totales",        value: totalVentas,      sub: `${ventasPorEstado.PENDIENTE} pendientes` },
              { label: "Productos activos",     value: totalProductos,   sub: "en catálogo" },
              { label: "Tasa de confirmación",  value: `${totalVentas ? Math.round((ventasPorEstado.CONFIRMADO / totalVentas) * 100) : 0}%`, sub: "ventas confirmadas" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl px-5 py-5 border border-stone-100">
                <p className="text-xs text-stone-400 mb-2 font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className="text-2xl font-semibold text-stone-900" style={{ letterSpacing: "-0.03em" }}>
                  {kpi.value}
                </p>
                <p className="text-xs text-stone-400 mt-1">{kpi.sub}</p>
              </div>
            ))}
          </section>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* ── distribución de estados ── */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100">
              <h2 className="text-sm font-semibold text-stone-700 mb-5">Distribución de ventas</h2>

              {/* barra segmentada */}
              <div className="flex h-2.5 rounded-full overflow-hidden mb-5 gap-0.5">
                <div style={{ width: `${pctConf}%` }} className="bg-emerald-400 rounded-l-full" />
                <div style={{ width: `${pctPend}%` }} className="bg-amber-300" />
                <div style={{ width: `${pctCanc}%` }} className="bg-red-300 rounded-r-full" />
              </div>

              <div className="space-y-3">
                {(["CONFIRMADO", "PENDIENTE", "CANCELADO"] as EstadoVenta[]).map((e) => {
                  const s = ESTADO_STYLES[e];
                  return (
                    <div key={e} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="text-sm text-stone-600">{s.label}</span>
                      </div>
                      <span className="text-sm font-medium text-stone-800">{ventasPorEstado[e]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── bajo stock ── */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-stone-700">Productos con bajo stock</h2>
                <Link href="/dashboard/products" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                  Ver todos →
                </Link>
              </div>

              {productosBajoStock.length === 0 ? (
                <p className="text-sm text-stone-400 py-4 text-center">Sin alertas de stock 🎉</p>
              ) : (
                <div className="space-y-3">
                  {productosBajoStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{p.nombre}</p>
                        <p className="text-xs text-stone-400">{p.marca}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.stock === 0
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── ventas recientes ── */}
          <section className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
              <h2 className="text-sm font-semibold text-stone-700">Ventas recientes</h2>
              <Link href="/dashboard/sales" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                Ver todas →
              </Link>
            </div>

            {/* tabla desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-50">
                    {["Orden", "Fecha", "Artículos", "Total", "Estado"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-stone-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventasRecientes.map((v) => (
                    <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-stone-400 truncate max-w-[120px]">
                        #{v.ordenId.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-stone-600">{fmtFecha(v.creadoEn)}</td>
                      <td className="px-6 py-4 text-stone-600">{v.items} ítem{v.items !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-4 font-medium text-stone-900">{fmt(v.total)}</td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={v.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* lista mobile */}
            <div className="sm:hidden divide-y divide-stone-50">
              {ventasRecientes.map((v) => (
                <div key={v.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-stone-400">#{v.ordenId.slice(-8)}</p>
                    <p className="text-sm font-medium text-stone-800 mt-0.5">{fmt(v.total)}</p>
                    <p className="text-xs text-stone-400">{fmtFecha(v.creadoEn)}</p>
                  </div>
                  <EstadoBadge estado={v.estado} />
                </div>
              ))}
            </div>

            {ventasRecientes.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-10">No hay ventas registradas aún.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}