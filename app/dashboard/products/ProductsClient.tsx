"use client";
// app/dashboard/products/ProductsClient.tsx

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── tipos ──────────────────────────────────────────────────
interface Talle  { talle: string; stock: number }
interface Producto {
  id: string; nombre: string; marca: string; precio: number;
  stock: number; activo: boolean; imagenUrl: string | null;
  talles: Talle[]; creadoEn: string;
}
interface Props {
  productos: Producto[]; total: number; page: number;
  perPage: number; q: string; estadoFiltro: string;
}

// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// ── modal confirmación de eliminación ─────────────────────
function ConfirmModal({ nombre, onConfirm, onCancel, loading }: {
  nombre: string; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onCancel}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: 360, boxShadow: "0 8px 32px rgba(0,0,0,.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1c1b19", marginBottom: 8 }}>
          ¿Eliminar producto?
        </p>
        <p style={{ fontSize: 13, color: "#9e9a92", marginBottom: 24, lineHeight: 1.5 }}>
          Vas a desactivar <strong style={{ color: "#3d3d3a" }}>{nombre}</strong>. No se eliminará de la base de datos.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "8px 18px", borderRadius: 8, border: "0.5px solid #d4d2cc", background: "transparent", fontSize: 13, cursor: "pointer", color: "#3d3d3a" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}
          >
            {loading ? "Eliminando…" : "Sí, desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── card de producto ───────────────────────────────────────
function ProductCard({ p, onDelete }: { p: Producto; onDelete: (id: string, nombre: string) => void }) {
  const stockTotal = p.talles.reduce((a, t) => a + t.stock, 0) || p.stock;
  const stockBajo  = stockTotal <= 3;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "0.5px solid #e8e6e0",
      overflow: "hidden", display: "flex", flexDirection: "column",
      opacity: p.activo ? 1 : .55,
    }}>
      {/* imagen / placeholder */}
      <div style={{ height: 140, background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {p.imagenUrl
          ? <img src={p.imagenUrl} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 36 }}>👟</span>
        }
        {!p.activo && (
          <span style={{ position: "absolute", top: 10, right: 10, background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99 }}>
            Inactivo
          </span>
        )}
        {p.activo && stockBajo && (
          <span style={{ position: "absolute", top: 10, right: 10, background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 99 }}>
            Bajo stock
          </span>
        )}
      </div>

      {/* info */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontSize: 11, color: "#9e9a92", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>{p.marca}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1b19", letterSpacing: "-.02em", lineHeight: 1.3 }}>{p.nombre}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#111", marginTop: 4, letterSpacing: "-.02em" }}>{fmt(p.precio)}</p>

        {/* talles */}
        {p.talles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {p.talles.map((t) => (
              <span
                key={t.talle}
                style={{
                  fontSize: 11, padding: "2px 7px", borderRadius: 6,
                  border: "0.5px solid #e8e6e0",
                  background: t.stock === 0 ? "#fef2f2" : "#f6f5f3",
                  color: t.stock === 0 ? "#ef4444" : "#5f5e5a",
                }}
              >
                {t.talle}
                {t.stock === 0 && " ✕"}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: "#b4b0a8", marginTop: 6 }}>
          Stock total: <strong style={{ color: stockBajo ? "#d97706" : "#3d3d3a" }}>{stockTotal} u.</strong>
        </p>
      </div>

      {/* acciones */}
      <div style={{ display: "flex", borderTop: "0.5px solid #f2f0ec" }}>
        <Link
          href={`/dashboard/products/${p.id}/edit`}
          style={{ flex: 1, padding: "11px 0", textAlign: "center", fontSize: 12, fontWeight: 500, color: "#3d3d3a", textDecoration: "none", borderRight: "0.5px solid #f2f0ec" }}
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(p.id, p.nombre)}
          style={{ flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 500, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Desactivar
        </button>
      </div>
    </div>
  );
}

// ── componente principal ───────────────────────────────────
export default function ProductsClient({ productos, total, page, perPage, q, estadoFiltro }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const totalPages = Math.ceil(total / perPage);

  // ── navegación con URL params ──────────────────────────
  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  // ── desactivar producto ────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: false }) });
      if (!res.ok) throw new Error("Error al desactivar el producto");
      setDeleteTarget(null);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const FILTROS = [
    { label: "Todos",     value: "todos"    },
    { label: "Activos",   value: "activo"   },
    { label: "Inactivos", value: "inactivo" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#f6f5f3", minHeight: "100vh" }}>

      {/* topbar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", background: "#f6f5f3", borderBottom: "0.5px solid #e2e0dc", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "#1c1b19", letterSpacing: "-.02em" }}>Productos</h1>
          <p style={{ fontSize: 11, color: "#9e9a92", marginTop: 2 }}>{total} producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/products/new"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: "#111", color: "#c8f060", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
        >
          + Nuevo producto
        </Link>
      </header>

      <div style={{ padding: "20px 28px", maxWidth: 1100 }}>

        {/* búsqueda + filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            type="search"
            defaultValue={q}
            placeholder="Buscar por nombre, marca…"
            onChange={(e) => navigate({ q: e.target.value, page: "1" })}
            style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 9, border: "0.5px solid #d4d2cc", background: "#fff", fontSize: 13, color: "#1c1b19", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => navigate({ estado: f.value === "todos" ? "" : f.value, page: "1" })}
                style={{
                  padding: "9px 16px", borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: estadoFiltro === f.value || (f.value === "todos" && !estadoFiltro) ? 600 : 400,
                  background: estadoFiltro === f.value || (f.value === "todos" && !estadoFiltro) ? "#111" : "#fff",
                  color:      estadoFiltro === f.value || (f.value === "todos" && !estadoFiltro) ? "#c8f060" : "#5f5e5a",
                  border: "0.5px solid #d4d2cc",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 16px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* grid de productos */}
        {isPending ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9e9a92", fontSize: 14 }}>Cargando…</div>
        ) : productos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 15, color: "#9e9a92" }}>No hay productos que coincidan con tu búsqueda.</p>
            <Link href="/dashboard/products/new" style={{ display: "inline-block", marginTop: 16, fontSize: 13, color: "#111", fontWeight: 500 }}>
              + Crear el primero
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {productos.map((p) => (
              <ProductCard key={p.id} p={p} onDelete={(id, nombre) => setDeleteTarget({ id, nombre })} />
            ))}
          </div>
        )}

        {/* paginación */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 }}>
            <button
              onClick={() => navigate({ page: String(page - 1) })}
              disabled={page === 1}
              style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid #d4d2cc", background: "#fff", fontSize: 13, color: "#3d3d3a", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? .4 : 1 }}
            >
              ← Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => navigate({ page: String(n) })}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: "0.5px solid #d4d2cc", fontSize: 13, cursor: "pointer",
                  background: n === page ? "#111" : "#fff",
                  color:      n === page ? "#c8f060" : "#3d3d3a",
                  fontWeight: n === page ? 600 : 400,
                }}
              >
                {n}
              </button>
            ))}

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

      {/* modal confirmación */}
      {deleteTarget && (
        <ConfirmModal
          nombre={deleteTarget.nombre}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}