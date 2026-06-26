"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type SellStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

interface Props {
   seller: {  name: string; email: string };
  metricas: {
    total_products: number;
    total_Ventas: number;
    ingresoTotal: number;
    ventasPorEstado: Record<SellStatus, number>;
  };
  ventasRecientes: {
    id: string;
    orderId: string;
    total: number;
    status: SellStatus;
    createdAt: string;
    items: number;
  }[];
   productosBajoStock: {
    id: string;
    name: string;
    stock: number;
    brand: string;
  }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

function EstadoBadge({ estado }: { estado: SellStatus }) {
  const map = {
    CONFIRMED: { cls: "badge-estado badge-confirmado", dot: "dot-success", label: "Confirmado" },
    PENDING:  { cls: "badge-estado badge-pendiente",  dot: "dot-warning", label: "Pendiente"  },
    CANCELLED:  { cls: "badge-estado badge-cancelado",  dot: "dot-danger",  label: "Cancelado"  },
  };
  const m = map[estado];
  return (
    <span className={m.cls}>
      <span className={`estado-dot ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function DashboardClient({  seller, metricas, ventasRecientes,  productosBajoStock }: Props) {
  const [fechaActual, setFechaActual] = useState("");
  useEffect(() => {
    setFechaActual(
      new Date().toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
  }, []); 
  const { total_products, total_Ventas, ingresoTotal, ventasPorEstado } = metricas;

  const totalEstados = Object.values(ventasPorEstado).reduce((a, b) => a + b, 0) || 1;
  const pctConf = (ventasPorEstado.CONFIRMED / totalEstados) * 100;
  const pctPend = (ventasPorEstado.PENDING  / totalEstados) * 100;
  const pctCanc = (ventasPorEstado.CANCELLED  / totalEstados) * 100;

  return (
    <div className="dashboard-page">

      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Resumen</h1>
          <p className="dashboard-topbar-date">
              {fechaActual}
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary" style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          + Nuevo producto
        </Link>
      </header>

      <div className="dashboard-content">

  {/* KPIs */}
  <section className="kpi-grid">
    {[
      { label: "Ingresos confirmados", value: fmt(ingresoTotal),   sub: "en ventas completadas" },
      { label: "Ventas totales",        value: total_Ventas,         sub: `${ventasPorEstado.PENDING} pendientes` },
      { label: "Productos activos",     value: total_products,      sub: "en catálogo" },
      { label: "Tasa de confirmación",  value: `${total_Ventas ? Math.round((ventasPorEstado.CONFIRMED / total_Ventas) * 100) : 0}%`, sub: "ventas confirmadas" },
    ].map((kpi) => (
      <div key={kpi.label} className="kpi-card">
        <p className="kpi-label">{kpi.label}</p>
        <p className="kpi-value">{kpi.value}</p>
        <p className="kpi-sub">{kpi.sub}</p>
      </div>
    ))}
  </section>

  {/* fila: distribución + bajo stock */}
  <div className="dashboard-cards-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 24, alignItems: "start" }}>

    {/* distribución */}
    <div className="card">
      <div className="card-header">
        <span className="card-title">Distribución de ventas</span>
      </div>
      <div className="card-body">
        <div className="seg-bar">
          <div className="seg-conf" style={{ flex: pctConf }} />
          <div className="seg-pend" style={{ flex: pctPend }} />
          <div className="seg-canc" style={{ flex: pctCanc }} />
        </div>
        <div className="estado-row">
          <div className="estado-dot-label"><span className="estado-dot dot-success" />Confirmado</div>
          <strong>{ventasPorEstado.CONFIRMED}</strong>
        </div>
        <div className="estado-row">
          <div className="estado-dot-label"><span className="estado-dot dot-warning" />Pendiente</div>
          <strong>{ventasPorEstado.PENDING}</strong>
        </div>
        <div className="estado-row">
          <div className="estado-dot-label"><span className="estado-dot dot-danger" />Cancelado</div>
          <strong>{ventasPorEstado.CANCELLED}</strong>
        </div>
      </div>
    </div>

    {/* bajo stock */}
    <div className="card">
      <div className="card-header">
        <span className="card-title">Productos con bajo stock</span>
        <Link href="/dashboard/products" className="card-link">Ver todos →</Link>
      </div>
      <table className="ventas-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Marca</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          { productosBajoStock.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-muted)", padding: "32px 0" }}>Sin alertas de stock 🎉</td></tr>
          ) : (
             productosBajoStock.map((p) => (
              <tr key={p.id}>
                <td style={{ fontSize: 13, fontWeight: 500, color: "var(--color-foreground)", padding: "14px 20px" }}>{p. name}</td>
                <td style={{ fontSize: 13, color: "var(--color-muted)", padding: "14px 16px" }}>{p.brand}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span className={p.stock === 0 ? "badge-stock-empty" : "badge-stock-warn"}>
                    {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* ventas recientes */}
  <div className="card">
    <div className="card-header">
      <span className="card-title">Ventas recientes</span>
      <Link href="/dashboard/sales" className="card-link">Ver todas →</Link>
    </div>
    <table className="ventas-table">
      <thead>
        <tr>
          {["Orden", "Fecha", "Ítems", "Total", "Estado"].map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ventasRecientes.length === 0 ? (
          <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-muted)", padding: "40px 0" }}>No hay ventas registradas aún.</td></tr>
        ) : (
          ventasRecientes.map((v) => (
            <tr key={v.id}>
              <td className="td-mono">#{v.orderId.toUpperCase()}</td>
              <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{fmtFecha(v.createdAt)}</td>
              <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{v.items} ítem{v.items !== 1 ? "s" : ""}</td>
              <td className="td-total">{fmt(v.total)}</td>
              <td style={{ padding: "14px 16px" }}><EstadoBadge estado={v.status} /></td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}

