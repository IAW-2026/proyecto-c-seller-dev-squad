"use client";

import Link from "next/link";

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

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  const map = {
    CONFIRMADO: { cls: "badge-estado badge-confirmado", dot: "dot-success", label: "Confirmado" },
    PENDIENTE:  { cls: "badge-estado badge-pendiente",  dot: "dot-warning", label: "Pendiente"  },
    CANCELADO:  { cls: "badge-estado badge-cancelado",  dot: "dot-danger",  label: "Cancelado"  },
  };
  const m = map[estado];
  return (
    <span className={m.cls}>
      <span className={`estado-dot ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function DashboardClient({ vendedor, metricas, ventasRecientes, productosBajoStock }: Props) {
  const { totalProductos, totalVentas, ingresoTotal, ventasPorEstado } = metricas;

  const totalEstados = Object.values(ventasPorEstado).reduce((a, b) => a + b, 0) || 1;
  const pctConf = (ventasPorEstado.CONFIRMADO / totalEstados) * 100;
  const pctPend = (ventasPorEstado.PENDIENTE  / totalEstados) * 100;
  const pctCanc = (ventasPorEstado.CANCELADO  / totalEstados) * 100;

  return (
    <div className="dashboard-page">

      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Resumen</h1>
          <p className="dashboard-topbar-date">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
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
            { label: "Ventas totales",        value: totalVentas,         sub: `${ventasPorEstado.PENDIENTE} pendientes` },
            { label: "Productos activos",     value: totalProductos,      sub: "en catálogo" },
            { label: "Tasa de confirmación",  value: `${totalVentas ? Math.round((ventasPorEstado.CONFIRMADO / totalVentas) * 100) : 0}%`, sub: "ventas confirmadas" },
          ].map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
              <p className="kpi-sub">{kpi.sub}</p>
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>

          {/* distribución */}
            <div className="dashboard-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>            <div className="card-header">
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
                <strong>{ventasPorEstado.CONFIRMADO}</strong>
              </div>
              <div className="estado-row">
                <div className="estado-dot-label"><span className="estado-dot dot-warning" />Pendiente</div>
                <strong>{ventasPorEstado.PENDIENTE}</strong>
              </div>
              <div className="estado-row">
                <div className="estado-dot-label"><span className="estado-dot dot-danger" />Cancelado</div>
                <strong>{ventasPorEstado.CANCELADO}</strong>
              </div>
            </div>
          </div>

          {/* bajo stock */}
            <div className="dashboard-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>            <div className="card-header">
              <span className="card-title">Productos con bajo stock</span>
              <Link href="/dashboard/products" className="card-link">Ver todos →</Link>
            </div>
            <div className="card-body">
              {productosBajoStock.length === 0 ? (
                <p className="text-muted" style={{ textAlign: "center", padding: "16px 0", fontSize: 13 }}>Sin alertas de stock 🎉</p>
              ) : (
                productosBajoStock.map((p) => (
                  <div key={p.id} className="stock-row">
                    <div>
                      <p className="stock-name">{p.nombre}</p>
                      <p className="stock-marca">{p.marca}</p>
                    </div>
                    <span className={p.stock === 0 ? "badge-stock-empty" : "badge-stock-warn"}>
                      {p.stock === 0 ? "Sin stock" : `${p.stock} u.`}
                    </span>
                  </div>
                ))
              )}
            </div>
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
                    <td className="td-mono">#{v.ordenId.slice(-8).toUpperCase()}</td>
                    <td>{fmtFecha(v.creadoEn)}</td>
                    <td>{v.items} ítem{v.items !== 1 ? "s" : ""}</td>
                    <td className="td-total">{fmt(v.total)}</td>
                    <td><EstadoBadge estado={v.estado} /></td>
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