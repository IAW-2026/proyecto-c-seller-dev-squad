"use client"; 
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
 
// ── tipos ──────────────────────────────────────────────────
type EstadoVenta = "CONFIRMADO" | "PENDIENTE" | "CANCELADO";
type Tab = "resumen" | "vendedores" | "productos" | "ventas";
 
interface Vendedor {
  id: string; nombre: string; email: string; descripcion: string;
  activo: boolean; creadoEn: string; totalProductos: number; totalVentas: number;
}
interface Producto {
  id: string; nombre: string; marca: string; precio: number;
  stock: number; activo: boolean; creadoEn: string; vendedor: string; totalVentas: number;
}
interface Venta {
  id: string; ordenId: string; total: number; estado: EstadoVenta;
  creadoEn: string; vendedor: string; items: number;
}
interface Stats {
  totalVendedores: number; vendedoresActivos: number;
  totalProductos: number; productosActivos: number;
  totalVentas: number; ventasConfirmadas: number; ingresoTotal: number;
}
interface Props { stats: Stats; vendedores: Vendedor[]; productos: Producto[]; ventas: Venta[] }
 
// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
 
const ESTADO_META: Record<EstadoVenta, { cls: string; dot: string; label: string }> = {
  CONFIRMADO: { cls: "badge-estado badge-confirmado", dot: "estado-dot dot-success", label: "Confirmado" },
  PENDIENTE:  { cls: "badge-estado badge-pendiente",  dot: "estado-dot dot-warning", label: "Pendiente"  },
  CANCELADO:  { cls: "badge-estado badge-cancelado",  dot: "estado-dot dot-danger",  label: "Cancelado"  },
};
 
function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  const m = ESTADO_META[estado];
  return <span className={m.cls}><span className={m.dot} />{m.label}</span>;
}
 
// ── modal confirmación ─────────────────────────────────────
function ConfirmModal({ mensaje, onConfirm, onCancel, loading }: {
  mensaje: string; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: "28px 32px", width: 360, border: "1px solid var(--color-border)" }} onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-foreground)", marginBottom: 8 }}>¿Confirmar acción?</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 24, lineHeight: 1.5 }}>{mensaje}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--color-border)", background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-foreground)" }}>Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, opacity: loading ? .7 : 1 }}>
            {loading ? "Procesando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── componente principal ───────────────────────────────────
export default function AdminClient({ stats, vendedores, productos, ventas }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("resumen");
  const [confirm, setConfirm] = useState<{ mensaje: string; onConfirm: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchV, setSearchV] = useState("");
  const [searchP, setSearchP] = useState("");
 
  // ── acciones ───────────────────────────────────────────
  async function toggleVendedor(id: string, activo: boolean) {
    setConfirm({
      mensaje: `Vas a ${activo ? "desactivar" : "activar"} este vendedor. ${activo ? "No podrá acceder al panel." : "Podrá volver a operar."}`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await fetch(`/api/admin/vendedores/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !activo }) });
          setConfirm(null);
          startTransition(() => router.refresh());
        } catch { setError("Error al actualizar el vendedor"); }
        finally { setLoading(false); }
      },
    });
  }
 
  async function toggleProducto(id: string, activo: boolean) {
    setConfirm({
      mensaje: `Vas a ${activo ? "desactivar" : "activar"} este producto. ${activo ? "Dejará de aparecer en el catálogo." : "Volverá a estar disponible."}`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !activo }) });
          setConfirm(null);
          startTransition(() => router.refresh());
        } catch { setError("Error al actualizar el producto"); }
        finally { setLoading(false); }
      },
    });
  }
 
  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "resumen",    label: "Resumen",    icon: "▦" },
    { id: "vendedores", label: "Vendedores", icon: "◉" },
    { id: "productos",  label: "Productos",  icon: "◫" },
    { id: "ventas",     label: "Ventas",     icon: "◈" },
  ];
 
  const vendedoresFiltrados = vendedores.filter(v =>
    v.nombre.toLowerCase().includes(searchV.toLowerCase()) ||
    v.email.toLowerCase().includes(searchV.toLowerCase())
  );
 
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchP.toLowerCase()) ||
    p.marca.toLowerCase().includes(searchP.toLowerCase()) ||
    p.vendedor.toLowerCase().includes(searchP.toLowerCase())
  );
 
  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Administración</h1>
          <p className="dashboard-topbar-date">Panel de control del sistema</p>
        </div>
      </header>
 
      <div className="dashboard-content">
 
        {error && (
          <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "10px 16px", borderRadius: 9, fontSize: 13, marginBottom: 16 }} onClick={() => setError(null)}>
            {error} — click para cerrar
          </div>
        )}
 
        {/* tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--color-surface)", padding: 4, borderRadius: 12, border: "1px solid var(--color-border)", marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 9, fontSize: 13, cursor: "pointer", border: "none", fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? "var(--color-primary)" : "transparent", color: tab === t.id ? "var(--color-on-primary)" : "var(--color-muted)", transition: "all .15s" }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
 
        {/* ── RESUMEN ── */}
        {tab === "resumen" && (
          <>
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {[
                { label: "Vendedores activos",   value: `${stats.vendedoresActivos} / ${stats.totalVendedores}` },
                { label: "Productos activos",    value: `${stats.productosActivos} / ${stats.totalProductos}` },
                { label: "Ventas totales",       value: stats.totalVentas },
                { label: "Ventas confirmadas",   value: stats.ventasConfirmadas },
                { label: "Ingresos totales",     value: fmt(stats.ingresoTotal) },
              ].map(k => (
                <div key={k.label} className="kpi-card">
                  <p className="kpi-label">{k.label}</p>
                  <p className="kpi-value">{k.value}</p>
                </div>
              ))}
            </div>
 
            {/* top vendedores */}
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <span className="card-title">Top vendedores por ventas</span>
                <button onClick={() => setTab("vendedores")} className="card-link" style={{ background: "none", border: "none", cursor: "pointer" }}>Ver todos →</button>
              </div>
              <table className="ventas-table">
                <thead><tr><th>Vendedor</th><th>Email</th><th>Productos</th><th>Ventas</th><th>Estado</th></tr></thead>
                <tbody>
                  {[...vendedores].sort((a, b) => b.totalVentas - a.totalVentas).slice(0, 5).map(v => (
                    <tr key={v.id}>
                      <td style={{ fontSize: 13, fontWeight: 500, color: "var(--color-foreground)", padding: "14px 20px" }}>{v.nombre}</td>
                      <td style={{ fontSize: 13, color: "var(--color-muted)", padding: "14px 16px" }}>{v.email}</td>
                      <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{v.totalProductos}</td>
                      <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{v.totalVentas}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className={v.activo ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                          <span className={v.activo ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                          {v.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
 
        {/* ── VENDEDORES ── */}
        {tab === "vendedores" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{vendedores.length} vendedores registrados</span>
              <input type="search" placeholder="Buscar…" value={searchV} onChange={e => setSearchV(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 12, color: "var(--color-foreground)", outline: "none", width: 200 }} />
            </div>
            <table className="ventas-table">
              <thead><tr><th>Vendedor</th><th>Email</th><th>Productos</th><th>Ventas</th><th>Registro</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {vendedoresFiltrados.map(v => (
                  <tr key={v.id}>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)" }}>{v.nombre}</p>
                      {v.descripcion && <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{v.descripcion.slice(0, 40)}…</p>}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--color-muted)", padding: "14px 16px" }}>{v.email}</td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px", textAlign: "center" }}>{v.totalProductos}</td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px", textAlign: "center" }}>{v.totalVentas}</td>
                    <td style={{ fontSize: 12, color: "var(--color-muted)", padding: "14px 16px" }}>{fmtFecha(v.creadoEn)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={v.activo ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                        <span className={v.activo ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                        {v.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => toggleVendedor(v.id, v.activo)}
                        style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "1px solid var(--color-border)", background: "var(--color-surface)", color: v.activo ? "var(--color-danger)" : "var(--color-success)" }}>
                        {v.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* ── PRODUCTOS ── */}
        {tab === "productos" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{productos.length} productos registrados</span>
              <input type="search" placeholder="Buscar…" value={searchP} onChange={e => setSearchP(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 12, color: "var(--color-foreground)", outline: "none", width: 200 }} />
            </div>
            <table className="ventas-table">
              <thead><tr><th>Producto</th><th>Vendedor</th><th>Precio</th><th>Stock</th><th>Ventas</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)" }}>{p.nombre}</p>
                      <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{p.marca}</p>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--color-muted)", padding: "14px 16px" }}>{p.vendedor}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)", padding: "14px 16px" }}>{fmt(p.precio)}</td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px", textAlign: "center" }}>
                      <span className={p.stock === 0 ? "badge-stock-empty" : p.stock <= 3 ? "badge-stock-warn" : undefined}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px", textAlign: "center" }}>{p.totalVentas}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={p.activo ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                        <span className={p.activo ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => toggleProducto(p.id, p.activo)}
                        style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "1px solid var(--color-border)", background: "var(--color-surface)", color: p.activo ? "var(--color-danger)" : "var(--color-success)" }}>
                        {p.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* ── VENTAS ── */}
        {tab === "ventas" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{ventas.length} ventas registradas</span>
            </div>
            <table className="ventas-table">
              <thead><tr><th>Orden</th><th>Vendedor</th><th>Ítems</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id}>
                    <td className="td-mono">#{v.ordenId.slice(-8).toUpperCase()}</td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{v.vendedor}</td>
                    <td style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px", textAlign: "center" }}>{v.items}</td>
                    <td className="td-total">{fmt(v.total)}</td>
                    <td style={{ fontSize: 13, color: "var(--color-muted)", padding: "14px 16px" }}>{fmtFecha(v.creadoEn)}</td>
                    <td style={{ padding: "14px 16px" }}><EstadoBadge estado={v.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
      </div>
 
      {confirm && (
        <ConfirmModal
          mensaje={confirm.mensaje}
          loading={loading}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
 