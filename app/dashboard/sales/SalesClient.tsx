"use client";
// app/dashboard/sales/SalesClient.tsx

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type EstadoVenta = "CONFIRMADO" | "PENDIENTE" | "CANCELADO";
interface DetalleProducto { nombre: string; marca: string; imagenUrl: string | null }
interface Detalle { cantidad: number; precioUnitario: number; talle: string; producto: DetalleProducto }
interface Venta { id: string; ordenId: string; total: number; estado: EstadoVenta; creadoEn: string; detalles: Detalle[] }
interface Resumen { count: number; sum: number }
interface Props { ventas: Venta[]; total: number; page: number; perPage: number; estadoFiltro: string; q: string; resumen: Record<string, Resumen> }

const fmt = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

const ESTADO_META: Record<EstadoVenta, { label: string; cls: string; dot: string }> = {
  CONFIRMADO: { label: "Confirmado", cls: "badge-estado badge-confirmado", dot: "estado-dot dot-success" },
  PENDIENTE:  { label: "Pendiente",  cls: "badge-estado badge-pendiente",  dot: "estado-dot dot-warning" },
  CANCELADO:  { label: "Cancelado",  cls: "badge-estado badge-cancelado",  dot: "estado-dot dot-danger"  },
};

function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  const m = ESTADO_META[estado];
  return <span className={m.cls}><span className={m.dot} />{m.label}</span>;
}

function VentaRow({ v, onCambiarEstado }: { v: Venta; onCambiarEstado: (id: string, estado: EstadoVenta) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr style={{ borderBottom: "1px solid var(--color-border)", cursor: "pointer", background: open ? "var(--color-surface-alt)" : "transparent" }} onClick={() => setOpen(o => !o)}>
        <td className="td-mono">#{v.ordenId.slice(-8).toUpperCase()}</td>
        <td className="ventas-td-fecha" style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{fmtFecha(v.creadoEn)}</td>
        <td className="ventas-td-items" style={{ fontSize: 13, color: "var(--color-foreground)", padding: "14px 16px" }}>{v.detalles.length} ítem{v.detalles.length !== 1 ? "s" : ""}</td>
        <td className="td-total">{fmt(v.total)}</td>
        <td style={{ padding: "14px 16px" }}><EstadoBadge estado={v.estado} /></td>
        <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 12, color: "var(--color-muted)" }}>{open ? "▲" : "▼"}</td>
      </tr>
      {open && (
        <tr style={{ background: "var(--color-surface-alt)" }}>
          <td colSpan={6} style={{ padding: "0 16px 16px" }}>
            <div className="card" style={{ marginTop: 8 }}>
              <div className="card-body" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Artículos</p>
                {v.detalles.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {d.producto.imagenUrl ? <img src={d.producto.imagenUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : "👟"}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)" }}>{d.producto.nombre}</p>
                        <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{d.producto.marca}{d.talle ? ` · Talle ${d.talle}` : ""} · ×{d.cantidad}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)" }}>{fmt(d.precioUnitario * d.cantidad)}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Cambiar estado</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {(["CONFIRMADO", "PENDIENTE", "CANCELADO"] as EstadoVenta[]).filter(e => e !== v.estado).map(e => (
                      <button key={e} onClick={ev => { ev.stopPropagation(); onCambiarEstado(v.id, e); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 12, cursor: "pointer", color: "var(--color-foreground)" }}>
                        → {ESTADO_META[e].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Total</p>
                  <p className="kpi-value" style={{ marginTop: 4 }}>{fmt(v.total)}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SalesClient({ ventas, total, page, perPage, estadoFiltro, q, resumen }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.ceil(total / perPage);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  async function handleCambiarEstado(id: string, estado: EstadoVenta) {
    setError(null);
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      router.refresh();
    } catch (e: any) { setError(e.message); }
  }

  const TABS = [
    { label: "Todas", value: "" }, { label: "Confirmadas", value: "CONFIRMADO" },
    { label: "Pendientes", value: "PENDIENTE" }, { label: "Canceladas", value: "CANCELADO" },
  ];

  const conf = resumen["CONFIRMADO"] ?? { count: 0, sum: 0 };
  const pend = resumen["PENDIENTE"]  ?? { count: 0, sum: 0 };
  const canc = resumen["CANCELADO"]  ?? { count: 0, sum: 0 };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Ventas</h1>
          <p className="dashboard-topbar-date">{total} venta{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}</p>
        </div>
      </header>

      <div className="dashboard-content">
        {/* métricas */}
        <div className="ventas-metricas" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Confirmadas", count: conf.count, sum: conf.sum, border: "var(--color-success)" },
            { label: "Pendientes",  count: pend.count, sum: pend.sum, border: "#f59e0b" },
            { label: "Canceladas",  count: canc.count, sum: canc.sum, border: "var(--color-danger)" },
          ].map(m => (
            <div key={m.label} className="kpi-card" style={{ borderLeft: `3px solid ${m.border}` }}>
              <p className="kpi-label">{m.label}</p>
              <p className="kpi-value">{m.count}</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>{fmt(m.sum)}</p>
            </div>
          ))}
        </div>

        {/* tabs + búsqueda */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--color-surface)", padding: 4, borderRadius: 10, border: "1px solid var(--color-border)", flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.value} onClick={() => navigate({ estado: t.value, page: "1" })}
                style={{ padding: "7px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "none", fontWeight: estadoFiltro === t.value ? 600 : 400, background: estadoFiltro === t.value ? "var(--color-primary)" : "transparent", color: estadoFiltro === t.value ? "var(--color-on-primary)" : "var(--color-muted)" }}>
                {t.label}
              </button>
            ))}
          </div>
          <input type="search" defaultValue={q} placeholder="Buscar por ID de orden…" onChange={e => navigate({ q: e.target.value, page: "1" })}
            style={{ flex: 1, minWidth: 160, padding: "9px 14px", borderRadius: 9, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", outline: "none" }} />
        </div>

        {error && <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "10px 16px", borderRadius: 9, fontSize: 13, marginBottom: 14 }}>{error}</div>}

        {/* tabla */}
        <div className="card">
          {isPending ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-muted)", fontSize: 14 }}>Cargando…</div>
          ) : ventas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}><p style={{ fontSize: 15, color: "var(--color-muted)" }}>No hay ventas que coincidan.</p></div>
          ) : (
            <table className="ventas-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th className="ventas-td-fecha">Fecha</th>
                  <th className="ventas-td-items">Ítems</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => <VentaRow key={v.id} v={v} onCambiarEstado={handleCambiarEstado} />)}
              </tbody>
            </table>
          )}
        </div>

        {/* paginación */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24 }}>
            <button onClick={() => navigate({ page: String(page - 1) })} disabled={page === 1} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? .4 : 1 }}>← Anterior</button>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Página {page} de {totalPages}</span>
            <button onClick={() => navigate({ page: String(page + 1) })} disabled={page === totalPages} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? .4 : 1 }}>Siguiente →</button>
          </div>
        )}
      </div>
    </div>
  );
}