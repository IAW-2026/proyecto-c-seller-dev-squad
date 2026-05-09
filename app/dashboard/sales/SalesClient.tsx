"use client";
// app/dashboard/sales/SalesClient.tsx

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// ── tipos ──────────────────────────────────────────────────
type EstadoVenta = "CONFIRMADO" | "PENDIENTE" | "CANCELADO";

interface DetalleProducto { nombre: string; marca: string; imagenUrl: string | null }
interface Detalle { cantidad: number; precioUnitario: number; talle: string; producto: DetalleProducto }
interface Venta {
  id: string; ordenId: string; total: number;
  estado: EstadoVenta; creadoEn: string; detalles: Detalle[];
}
interface Resumen { count: number; sum: number }
interface Props {
  ventas: Venta[]; total: number; page: number; perPage: number;
  estadoFiltro: string; q: string;
  resumen: Record<string, Resumen>;
}

// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const ESTADO_META: Record<EstadoVenta, { label: string; bg: string; text: string; dot: string }> = {
  CONFIRMADO: { label: "Confirmado", bg: "#ecfdf5", text: "#065f46", dot: "#34d399" },
  PENDIENTE:  { label: "Pendiente",  bg: "#fefce8", text: "#854d0e", dot: "#fbbf24" },
  CANCELADO:  { label: "Cancelado",  bg: "#fef2f2", text: "#991b1b", dot: "#f87171" },
};

// ── badge de estado ────────────────────────────────────────
function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  const m = ESTADO_META[estado];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: m.bg, color: m.text, fontSize: 12, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ── fila de venta con detalle expandible ──────────────────
function VentaRow({ v, onCambiarEstado }: { v: Venta; onCambiarEstado: (id: string, estado: EstadoVenta) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        style={{ borderBottom: "0.5px solid #f2f0ec", cursor: "pointer", background: open ? "#fafaf8" : "transparent" }}
        onClick={() => setOpen((o) => !o)}
      >
        <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#b4b0a8" }}>
          #{v.ordenId.slice(-8).toUpperCase()}
        </td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#5f5e5a" }}>{fmtFecha(v.creadoEn)}</td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#5f5e5a" }}>
          {v.detalles.length} ítem{v.detalles.length !== 1 ? "s" : ""}
        </td>
        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#1c1b19", letterSpacing: "-.02em" }}>
          {fmt(v.total)}
        </td>
        <td style={{ padding: "14px 16px" }}>
          <EstadoBadge estado={v.estado} />
        </td>
        <td style={{ padding: "14px 16px 14px 8px", textAlign: "right", fontSize: 16, color: "#9e9a92" }}>
          {open ? "▲" : "▼"}
        </td>
      </tr>

      {/* fila expandida con detalle */}
      {open && (
        <tr style={{ background: "#fafaf8" }}>
          <td colSpan={6} style={{ padding: "0 20px 20px" }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e8e6e0", overflow: "hidden", marginTop: 6 }}>

              {/* items */}
              <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid #f2f0ec" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9e9a92", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                  Artículos
                </p>
                {v.detalles.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {d.producto.imagenUrl
                          ? <img src={d.producto.imagenUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                          : "👟"
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1b19" }}>{d.producto.nombre}</p>
                        <p style={{ fontSize: 12, color: "#9e9a92" }}>
                          {d.producto.marca}{d.talle ? ` · Talle ${d.talle}` : ""} · ×{d.cantidad}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1b19" }}>
                      {fmt(d.precioUnitario * d.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              {/* total + cambio de estado */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#9e9a92", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>Cambiar estado</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {(["CONFIRMADO", "PENDIENTE", "CANCELADO"] as EstadoVenta[]).filter((e) => e !== v.estado).map((e) => (
                      <button
                        key={e}
                        onClick={(ev) => { ev.stopPropagation(); onCambiarEstado(v.id, e); }}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "0.5px solid #d4d2cc",
                          background: "#fff", fontSize: 12, cursor: "pointer", color: "#3d3d3a",
                        }}
                      >
                        → {ESTADO_META[e].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "#9e9a92", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>Total</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#1c1b19", letterSpacing: "-.03em", marginTop: 4 }}>{fmt(v.total)}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── componente principal ───────────────────────────────────
export default function SalesClient({ ventas, total, page, perPage, estadoFiltro, q, resumen }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState<string | null>(null);

  const totalPages = Math.ceil(total / perPage);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  async function handleCambiarEstado(id: string, estado: EstadoVenta) {
    setError(null);
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const TABS = [
    { label: "Todas",       value: ""           },
    { label: "Confirmadas", value: "CONFIRMADO" },
    { label: "Pendientes",  value: "PENDIENTE"  },
    { label: "Canceladas",  value: "CANCELADO"  },
  ];

  const conf = resumen["CONFIRMADO"] ?? { count: 0, sum: 0 };
  const pend = resumen["PENDIENTE"]  ?? { count: 0, sum: 0 };
  const canc = resumen["CANCELADO"]  ?? { count: 0, sum: 0 };

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#f6f5f3", minHeight: "100vh" }}>

      {/* topbar */}
      <header style={{ padding: "16px 28px", background: "#f6f5f3", borderBottom: "0.5px solid #e2e0dc", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: "#1c1b19", letterSpacing: "-.02em" }}>Ventas</h1>
        <p style={{ fontSize: 11, color: "#9e9a92", marginTop: 2 }}>{total} venta{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}</p>
      </header>

      <div style={{ padding: "20px 28px", maxWidth: 1000 }}>

        {/* métricas rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Confirmadas", count: conf.count, sum: conf.sum, color: "#34d399", bg: "#ecfdf5", text: "#065f46" },
            { label: "Pendientes",  count: pend.count, sum: pend.sum, color: "#fbbf24", bg: "#fefce8", text: "#854d0e" },
            { label: "Canceladas",  count: canc.count, sum: canc.sum, color: "#f87171", bg: "#fef2f2", text: "#991b1b" },
          ].map((m) => (
            <div key={m.label} style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e6e0", padding: "14px 18px", borderLeft: `3px solid ${m.color}` }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "#9e9a92", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#1c1b19", letterSpacing: "-.03em", lineHeight: 1 }}>{m.count}</p>
              <p style={{ fontSize: 12, color: m.text, marginTop: 4, background: m.bg, display: "inline-block", padding: "2px 8px", borderRadius: 6 }}>
                {fmt(m.sum)}
              </p>
            </div>
          ))}
        </div>

        {/* tabs de filtro + búsqueda */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 10, border: "0.5px solid #e8e6e0" }}>
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => navigate({ estado: t.value, page: "1" })}
                style={{
                  padding: "7px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "none", fontWeight: estadoFiltro === t.value ? 600 : 400,
                  background: estadoFiltro === t.value ? "#111" : "transparent",
                  color:      estadoFiltro === t.value ? "#c8f060" : "#5f5e5a",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            defaultValue={q}
            placeholder="Buscar por ID de orden…"
            onChange={(e) => navigate({ q: e.target.value, page: "1" })}
            style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 9, border: "0.5px solid #d4d2cc", background: "#fff", fontSize: 13, color: "#1c1b19", outline: "none" }}
          />
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 16px", borderRadius: 9, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* tabla */}
        <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e6e0", overflow: "hidden" }}>
          {isPending ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9e9a92", fontSize: 14 }}>Cargando…</div>
          ) : ventas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 15, color: "#9e9a92" }}>No hay ventas que coincidan.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid #f2f0ec" }}>
                  {["Orden", "Fecha", "Ítems", "Total", "Estado", ""].map((h) => (
                    <th key={h} style={{ padding: "11px 16px 11px 20px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#9e9a92", textTransform: "uppercase", letterSpacing: ".07em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <VentaRow key={v.id} v={v} onCambiarEstado={handleCambiarEstado} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* paginación */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24 }}>
            <button
              onClick={() => navigate({ page: String(page - 1) })}
              disabled={page === 1}
              style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid #d4d2cc", background: "#fff", fontSize: 13, color: "#3d3d3a", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? .4 : 1 }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 13, color: "#9e9a92" }}>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => navigate({ page: String(page + 1) })}
              disabled={page === totalPages}
              style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid #d4d2cc", background: "#fff", fontSize: 13, color: "#3d3d3a", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? .4 : 1 }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}