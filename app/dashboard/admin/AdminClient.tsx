"use client"; 
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
 
// ── tipos ──────────────────────────────────────────────────
type SellStatus = "CONFIRMED" | "PENDING" | "CANCELLED";
type Tab = "resumen" | "sellers" | "products" | "ventas";
 
interface Seller{
  id: string;  name: string; email: string; description: string | null;
  active: boolean; createdAt: string; totalProducts: number; totalSells: number;
}
interface  Product {
  id: string;  name: string; brand: string; price: number;
  stock: number; active: boolean; image: string | null; createdAt: string;  seller: string; totalSells: number;
}
interface Sell {
  id: string; orderId: string; total: number; status: SellStatus;
  createdAt: string;  seller: string; items: number;
}
interface Stats {
  totalSellers: number;  activeSellers: number;
  totalProducts: number; activeProducts: number;
  totalSells: number; confirmedSells: number; totalRevenue: number;
}
interface Props { stats: Stats;  sellers:  Seller[];  products:  Product[]; sells: Sell[] }
 
// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
 
const ESTADO_META: Record<SellStatus, { cls: string; dot: string; label: string }> = {
  CONFIRMED: { cls: "badge-estado badge-confirmado", dot: "estado-dot dot-success", label: "Confirmado" },
  PENDING:  { cls: "badge-estado badge-pendiente",  dot: "estado-dot dot-warning", label: "Pendiente"  },
  CANCELLED:  { cls: "badge-estado badge-cancelado",  dot: "estado-dot dot-danger",  label: "Cancelado"  },
};
 
function EstadoBadge({ estado }: { estado: SellStatus }) {
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
          <button 
              type= "button" 
              onClick={onCancel} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--color-border)", background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--color-foreground)" }}>Cancelar</button>
          <button 
           type="button" 
           onClick={onConfirm} disabled={loading} className="btn-danger" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, opacity: loading ? .7 : 1 }}>
            {loading ? "Procesando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── componente principal ───────────────────────────────────
export default function AdminClient({ stats,  sellers,  products, sells }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("resumen");
  const [confirm, setConfirm] = useState<{ mensaje: string; onConfirm: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchV, setSearchV] = useState("");
  const [searchP, setSearchP] = useState("");
 
  // ── acciones ───────────────────────────────────────────
  async function toggle_seller(id: string, active: boolean) {
    setConfirm({
      mensaje: `Vas a ${active ? "desactivar" : "activar"} este  seller. ${active ? "No podrá acceder al panel." : "Podrá volver a operar."}`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await fetch(`/api/admin/vendedores/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
          setConfirm(null);
          startTransition(() => router.refresh());
        } catch { setError("Error al actualizar el  seller"); }
        finally { setLoading(false); }
      },
    });
  }
 
  async function toggle_product(id: string, active: boolean) {
    setConfirm({
      mensaje: `Vas a ${active ? "desactivar" : "activar"} este  product. ${active ? "Dejará de aparecer en el catálogo." : "Volverá a estar disponible."}`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !active }),
          });
          setConfirm(null);
          startTransition(() => router.refresh());
        } catch { setError("Error al actualizar el  product"); }
        finally { setLoading(false); }
      },
    });
  }

function ConfirmModal({ mensaje, onConfirm, onCancel, loading }: {
  mensaje: string; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div className="card" style={{ padding: "28px 32px", width: 360 }} onClick={e => e.stopPropagation()}>
        <p className="dashboard-topbar-title" style={{ marginBottom: 8 }}>¿Confirmar acción?</p>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>{mensaje}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="btn-outline"
            style={{ opacity: loading ? .7 : 1, color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>
            {loading ? "Procesando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "resumen",    label: "Resumen",    icon: "▦" },
    { id: "sellers", label: "Vendedores", icon: "◉" },
    { id: "products",  label: "Productos",  icon: "◫" },
    { id: "ventas",     label: "Ventas",     icon: "◈" },
  ];
 
  const  sellersFiltrados =  sellers.filter(v =>
    v.name.toLowerCase().includes(searchV.toLowerCase()) ||
    v.email.toLowerCase().includes(searchV.toLowerCase())
  );
 
  const  productsFiltrados =  products.filter(p =>
    p.name.toLowerCase().includes(searchP.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchP.toLowerCase()) ||
    p.seller.toLowerCase().includes(searchP.toLowerCase())
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
          <div className="banner-error" style={{ cursor: "pointer" }} onClick={() => setError(null)}>
            {error} — click para cerrar
          </div>
        )}

        {/* tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button type="button" key={t.id} onClick={() => setTab(t.id)}
              className={`admin-tab${tab === t.id ? " active" : ""}`}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── RESUMEN ── */}
        {tab === "resumen" && (
          <>
            <div className="kpi-grid admin-kpi-grid">
              {[
                { label: "Vendedores activos",  value: `${stats.activeSellers} / ${stats.totalSellers}` },
                { label: "Productos activos",   value: `${stats.activeProducts} / ${stats.totalProducts}` },
                { label: "Ventas totales",      value: stats.totalSells },
                { label: "Ventas confirmadas",  value: stats.confirmedSells },
                { label: "Ingresos totales",    value: fmt(stats.totalRevenue) },
              ].map(k => (
                <div key={k.label} className="kpi-card">
                  <p className="kpi-label">{k.label}</p>
                  <p className="kpi-value">{k.value}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <span className="card-title">Top vendedores por ventas</span>
                <button type="button" onClick={() => setTab("sellers")} className="card-link" style={{ background: "none", border: "none", cursor: "pointer" }}>Ver todos →</button>
              </div>
              <table className="ventas-table">
                <thead><tr><th>Vendedor</th><th>Email</th><th>Productos</th><th>Ventas</th><th>Estado</th></tr></thead>
                <tbody>
                  {[...sellers].sort((a, b) => b.totalSells - a.totalSells).slice(0, 5).map(v => (
                    <tr key={v.id}>
                      <td className="admin-td-name">{v.name}</td>
                      <td className="admin-td-muted">{v.email}</td>
                      <td className="admin-td-center">{v.totalProducts}</td>
                      <td className="admin-td-center">{v.totalSells}</td>
                      <td className="admin-td">
                        <span className={v.active ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                          <span className={v.active ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                          {v.active ? "activo" : "inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── SELLERS ── */}
        {tab === "sellers" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{sellers.length} vendedores registrados</span>
              <input type="search" placeholder="Buscar…" value={searchV}
                onChange={e => setSearchV(e.target.value)} className="admin-search" />
            </div>
            <div className="admin-table-wrapper">
             <table className="ventas-table">
              <thead><tr><th>Vendedor</th><th>Email</th><th>Productos</th><th>Ventas</th><th className="admin-hide-mobile"> Registro</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {sellersFiltrados.map(v => (
                  <tr key={v.id}>
                    <td className="admin-td admin-td-vendedor-mobile">
                      <p className="admin-td-name-text">{v.name}</p>
                      {v.description && <p className="admin-td-sub admin-hide-mobile">{v.description.slice(0, 40)}…</p>}
                    </td>
                    <td className="admin-td-muted admin-hide-mobile">{v.email}</td>
                    <td className="admin-td-center admin-hide-mobile">{v.totalProducts}</td>
                    <td className="admin-td-center">{v.totalSells}</td>
                    <td className="admin-td-muted admin-hide-mobile">{fmtFecha(v.createdAt)}</td>
                    <td className="admin-td">
                      <span className={v.active ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                        <span className={v.active ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                        {v.active ? "activo" : "inactivo"}
                      </span>
                    </td>
                    <td className="admin-td">
                      <button type="button" onClick={() => toggle_seller(v.id, v.active)}
                        className={`admin-action-btn${v.active ? " danger" : " success"}`}>
                       <span className="admin-hide-mobile">{v.active ? "Desactivar" : "Activar"}</span>
                       <span className="admin-show-mobile">{v.active ? "✕" : "✓"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{products.length} productos registrados</span>
              <input type="search" placeholder="Buscar…" value={searchP}
                onChange={e => setSearchP(e.target.value)} className="admin-search" />
            </div>
            <div className="admin-table-wrapper">
             <table className="ventas-table">
              <thead><tr><th>Producto</th><th>Vendedor</th><th>Precio</th><th>Stock</th><th className="admin-hide-mobile">Ventas</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {productsFiltrados.map(p => (
                  <tr key={p.id}>
                    <td className="admin-td">
                      <p className="admin-td-name-text">{p.name}</p>
                      <p className="admin-td-sub">{p.brand}</p>
                    </td>
                    <td className="admin-td-muted admin-hide-mobile">{p.seller}</td>
                    <td className="admin-td-bold admin-hide-mobile">{fmt(p.price)}</td>
                    <td className="admin-td-center">
                      <span className={p.stock === 0 ? "badge-stock-empty" : p.stock <= 3 ? "badge-stock-warn" : undefined}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="admin-td-center admin-hide-mobile">{p.totalSells}</td>
                    <td className="admin-td">
                      <span className={p.active ? "badge-estado badge-confirmado" : "badge-estado badge-cancelado"}>
                        <span className={p.active ? "estado-dot dot-success" : "estado-dot dot-danger"} />
                        {p.active ? "activo" : "inactivo"}
                      </span>
                    </td>
                    <td className="admin-td">
                      <button type="button" onClick={() => toggle_product(p.id, p.active)}
                        className={`admin-action-btn${p.active ? " danger" : " success"}`}>
                         <span className="admin-hide-mobile">{p.active ? "Desactivar" : "Activar"}</span>
                         <span className="admin-show-mobile">{p.active ? "✕" : "✓"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
        )}

        {/* ── VENTAS ── */}
        {tab === "ventas" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">{sells.length} ventas registradas</span>
            </div>
            <div className="admin-table-wrapper">
             <table className="ventas-table">
              <thead><tr><th>Orden</th><th>Vendedor</th><th>Ítems</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {sells.map(v => (
                  <tr key={v.id}>
                    <td className="td-mono">#{v.orderId}</td>
                    <td className="admin-td-muted">{v.seller}</td>
                    <td className="admin-td-center">{v.items}</td>
                    <td className="td-total">{fmt(v.total)}</td>
                    <td className="admin-td-muted">{fmtFecha(v.createdAt)}</td>
                    <td className="admin-td"><EstadoBadge estado={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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