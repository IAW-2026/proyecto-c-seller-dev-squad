"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── tipos ──────────────────────────────────────────────────
interface Size   { size: string; stock: number }
interface  Product {
  id: string;  name: string; brand: string; price: number;
  stock: number; active: boolean; image: string | null;
  sizes: Size[]; createdAt: string;
}
interface Props {
   products:  Product[]; total: number; page: number;
  perPage: number; q: string; estadoFiltro: string;
}

// ── helpers ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// ── modal confirmación de eliminación ─────────────────────
function ConfirmModal({  name, onConfirm, onCancel, loading }: {
   name: string; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onCancel}
    >
      <div
        style={{ background: "var(--color-surface)", borderRadius: 16, padding: "28px 32px", width: 360, boxShadow: "0 8px 32px rgba(0,0,0,.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }} className="text-primary">
          ¿Eliminar  product?
        </p>
        <p style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.5 }} className="text-muted">
          Vas a desactivar <strong className="text-primary">{ name}</strong>. No se eliminará de la base de datos.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-outline"
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              color: "var(--color-danger)",
              borderColor: "var(--color-danger)",
            }}
          >
            {loading ? "Eliminando…" : "Sí, desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return <span style={{ fontSize: 36 }}>👟</span>;
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setError(true)}
    />
  );
}

// ── card de  product ───────────────────────────────────────
function ProductCard({ p, onDelete }: { p:  Product; onDelete: (id: string,  name: string) => void }) {
  const stockTotal = p.sizes.reduce((a, t) => a + t.stock, 0) || p.stock;
  const stockBajo  = stockTotal <= 3;

  return (
    <div className={`product-card${p.active ? "" : " inactive"}`}>

      {/* imagen / placeholder */}
      <div className="product-card-image">
        {p.image
           ? <ProductImage src={p.image} alt={p.name} />        
           : <span style={{ fontSize: 36 }}>👟</span>
        }
        {!p.active && (
          <span className="badge-estado badge-inactive" style={{ position: "absolute", top: 10, right: 10 }}>
            Inactive
          </span>
        )}
        {p.active && stockBajo && (
          <span className="badge-estado badge-pendiente" style={{ position: "absolute", top: 10, right: 10 }}>
            Bajo stock
          </span>
        )}
      </div>

      {/* info */}
      <div className="product-card-body">
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }} className="text-muted">
          {p.brand}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.3 }} className="text-primary">
          {p.name}
        </p>
        <p className="product-card-price">{fmt(p.price)}</p>

        {/* sizes */}
        {p.sizes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {p.sizes.map((t) => (
              <span key={t.size} className={`size-chip${t.stock === 0 ? " agotado" : ""}`}>
                {t.size}{t.stock === 0 && " ✕"}
              </span>
            ))}
          </div>
        )}

        <p className={`product-card-stock${stockBajo ? " warn" : ""}`}>
          Stock total: <strong>{stockTotal} u.</strong>
        </p>
      </div>

      {/* acciones */}
      <div className="product-card-actions">
        <Link href={`/dashboard/products/${p.id}/edit`} className="product-card-action-btn">
          Editar
        </Link>
        <button
          onClick={() => onDelete(p.id, p.name)}
          className="product-card-action-btn danger"
          disabled={!p.active}
          style={{ opacity: !p.active ? 0.4 : 1, cursor: !p.active ? "not-allowed" : "pointer" }}
        >
          Desactivar
        </button>
      </div>
    </div>
  );
}


// ── componente principal ───────────────────────────────────
export default function ProductsClient({  products, total, page, perPage, q, estadoFiltro }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string;  name: string } | null>(null);
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

  // ── desactivar  product ────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      if (!res.ok) throw new Error("Error al desactivar el  producto");
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
    { label: "Activos",   value: "active"   },
    { label: "Inactivos", value: "inactive" },
  ];

  return (
    <div className="products-page">

      {/* topbar */}
      <header className="products-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Productos</h1>
          <p className="dashboard-topbar-date">
            {total}  producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-accent">
          + Nuevo producto
        </Link>
      </header>

      <div className="products-content">

        {/* búsqueda + filtros */}
        <div className="products-filters">
          <input
            type="search"
            defaultValue={q}
            placeholder="Buscar por  nombre, marca…"
            onChange={(e) => navigate({ q: e.target.value, page: "1" })}
            className="products-search"
          />
          <div style={{ display: "flex", gap: 6 }}>
            {FILTROS.map((f) => {
              const isActive = estadoFiltro === f.value || (f.value === "todos" && !estadoFiltro);
              return (
                <button
                  key={f.value}
                  onClick={() => navigate({ estado: f.value === "todos" ? "" : f.value, page: "1" })}
                  className={isActive ? "btn-accent" : "btn-outline"}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="banner-error">{error}</div>}

        {/* grid de  products */}
        {isPending ? (
          <div className="products-empty">
            <p className="text-muted" style={{ fontSize: 14 }}>Cargando…</p>
          </div>
        ) :  products.length === 0 ? (
          <div className="products-empty">
            <p className="text-muted" style={{ fontSize: 15 }}>
              No hay  productos que coincidan con tu búsqueda.
            </p>
            <Link
              href="/dashboard/products/new"
              className="text-primary"
              style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 500 }}
            >
              + Crear el primero
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            { products.map((p) => (
              <ProductCard key={p.id} p={p} onDelete={(id,  name) => setDeleteTarget({ id,  name })} />
            ))}
          </div>
        )}

        {/* paginación */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 }}>
            <button
              onClick={() => navigate({ page: String(page - 1) })}
              disabled={page === 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => navigate({ page: String(n) })}
                className={`pagination-page${n === page ? " active" : ""}`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => navigate({ page: String(page + 1) })}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* modal confirmación */}
      {deleteTarget && (
        <ConfirmModal
           name={deleteTarget. name}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}