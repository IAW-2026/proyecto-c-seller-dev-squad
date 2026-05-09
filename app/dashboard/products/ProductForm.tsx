"use client";
// app/dashboard/products/ProductForm.tsx
// Reutilizable para crear y editar. Maneja talles dinámicos, validación client-side
// y submit a la API route correspondiente.

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── tipos ──────────────────────────────────────────────────
interface TalleItem { talle: string; stock: number }

interface ProductoInicial {
  id: string; nombre: string; descripcion: string; precio: number;
  stock: number; marca: string; imagenUrl: string;
  activo: boolean; talles: TalleItem[];
}

interface Props {
  modo: "crear" | "editar";
  productoInicial?: ProductoInicial;
}

// ── talles predefinidos del dominio ───────────────────────
const TALLES_BASE = ["35","36","37","38","39","40","41","42","43","44","45"];

const MARCAS = ["Adidas","Converse","New Balance","Nike","Puma","Reebok","Vans","Otra"];

// ── helpers de UI ──────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5f5e5a", marginBottom: 6, letterSpacing: ".01em" }}>
      {children}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 13,
          border: `0.5px solid ${error ? "#fca5a5" : "#d4d2cc"}`,
          background: error ? "#fff7f7" : "#fff", color: "#1c1b19", outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </>
  );
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <>
      <textarea
        {...props}
        rows={3}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 13,
          border: `0.5px solid ${error ? "#fca5a5" : "#d4d2cc"}`,
          background: error ? "#fff7f7" : "#fff", color: "#1c1b19", outline: "none",
          resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
        }}
      />
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </>
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <>
      <select
        {...props}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 13,
          border: `0.5px solid ${error ? "#fca5a5" : "#d4d2cc"}`,
          background: "#fff", color: "#1c1b19", outline: "none",
          appearance: "none", boxSizing: "border-box",
        }}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </>
  );
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e6e0", marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #f2f0ec" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1b19", letterSpacing: "-.01em" }}>{title}</p>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ── componente principal ───────────────────────────────────
export default function ProductForm({ modo, productoInicial }: Props) {
  const router = useRouter();

  // ── estado del formulario ──
  const [nombre,      setNombre]      = useState(productoInicial?.nombre      ?? "");
  const [descripcion, setDescripcion] = useState(productoInicial?.descripcion ?? "");
  const [precio,      setPrecio]      = useState(productoInicial?.precio?.toString() ?? "");
  const [stock,       setStock]       = useState(productoInicial?.stock?.toString()  ?? "0");
  const [marca,       setMarca]       = useState(productoInicial?.marca       ?? "");
  const [imagenUrl,   setImagenUrl]   = useState(productoInicial?.imagenUrl   ?? "");
  const [activo,      setActivo]      = useState(productoInicial?.activo      ?? true);
  const [talles,      setTalles]      = useState<TalleItem[]>(productoInicial?.talles ?? []);

  // ── estado de UI ──
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  // ── talles ─────────────────────────────────────────────
  function toggleTalle(t: string) {
    setTalles((prev) => {
      const existe = prev.find((x) => x.talle === t);
      if (existe) return prev.filter((x) => x.talle !== t);
      return [...prev, { talle: t, stock: 1 }].sort((a, b) => Number(a.talle) - Number(b.talle));
    });
  }

  function setStockTalle(t: string, value: string) {
    setTalles((prev) =>
      prev.map((x) => x.talle === t ? { ...x, stock: Math.max(0, Number(value) || 0) } : x)
    );
  }

  // ── validación ─────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!nombre.trim())            e.nombre      = "El nombre es obligatorio";
    if (!marca)                    e.marca       = "Seleccioná una marca";
    if (!precio || Number(precio) <= 0) e.precio = "Ingresá un precio válido mayor a 0";
    if (Number(stock) < 0)         e.stock       = "El stock no puede ser negativo";
    if (imagenUrl && !/^https?:\/\/.+/.test(imagenUrl)) e.imagenUrl = "La URL debe empezar con http:// o https://";
    return e;
  }

  // ── submit ─────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const body = {
      nombre:      nombre.trim(),
      descripcion: descripcion.trim() || null,
      precio:      Number(precio),
      stock:       Number(stock),
      marca:       marca || null,
      imagenUrl:   imagenUrl.trim() || null,
      activo,
      talles,
    };

    setLoading(true);
    try {
      const url    = modo === "crear" ? "/api/products" : `/api/products/${productoInicial!.id}`;
      const method = modo === "crear" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ocurrió un error al guardar el producto");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/products"), 1200);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── render ─────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* info básica */}
      <Card title="Información básica">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Label required>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Nike Air Max 90"
              error={errors.nombre}
            />
          </div>

          <div>
            <Label required>Marca</Label>
            <Select value={marca} onChange={(e) => setMarca(e.target.value)} error={errors.marca}>
              <option value="">Seleccioná una marca</option>
              {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>

          <div>
            <Label required>Precio (ARS)</Label>
            <Input
              type="number" min="0" step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="89999"
              error={errors.precio}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Label>Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describí el producto: materiales, características, etc."
              error={errors.descripcion}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Label>URL de imagen</Label>
            <Input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://..."
              error={errors.imagenUrl}
            />
            {imagenUrl && /^https?:\/\/.+/.test(imagenUrl) && (
              <div style={{ marginTop: 10, width: 80, height: 80, borderRadius: 10, overflow: "hidden", border: "0.5px solid #e8e6e0" }}>
                <img src={imagenUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* stock + talles */}
      <Card title="Stock y talles">
        <div style={{ marginBottom: 18 }}>
          <Label>Stock general</Label>
          <Input
            type="number" min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            style={{ maxWidth: 140 }}
            error={errors.stock}
          />
          <p style={{ fontSize: 11, color: "#9e9a92", marginTop: 6 }}>
            Se usa como stock total si no cargás talles individuales.
          </p>
        </div>

        <div>
          <Label>Talles disponibles</Label>
          <p style={{ fontSize: 11, color: "#9e9a92", marginBottom: 12 }}>
            Seleccioná los talles y ajustá el stock por talle.
          </p>

          {/* selector de talles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {TALLES_BASE.map((t) => {
              const activo = talles.some((x) => x.talle === t);
              return (
                <button
                  key={t} type="button"
                  onClick={() => toggleTalle(t)}
                  style={{
                    width: 44, height: 44, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: activo ? "none" : "0.5px solid #d4d2cc",
                    background: activo ? "#111" : "#fff",
                    color:      activo ? "#c8f060" : "#5f5e5a",
                    transition: "all .15s",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* stock por talle */}
          {talles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {talles.map(({ talle, stock: st }) => (
                <div key={talle} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f6f5f3", borderRadius: 9, padding: "10px 14px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1b19", minWidth: 28 }}>
                    {talle}
                  </span>
                  <input
                    type="number" min="0" value={st}
                    onChange={(e) => setStockTalle(talle, e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 7, border: "0.5px solid #d4d2cc", fontSize: 13, background: "#fff", color: "#1c1b19", outline: "none" }}
                  />
                  <span style={{ fontSize: 11, color: "#9e9a92", flexShrink: 0 }}>u.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* visibilidad (solo en edición) */}
      {modo === "editar" && (
        <Card title="Visibilidad">
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div
              onClick={() => setActivo((v) => !v)}
              style={{
                width: 44, height: 24, borderRadius: 12, position: "relative", cursor: "pointer",
                background: activo ? "#111" : "#d4d2cc", transition: "background .2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: activo ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%",
                background: activo ? "#c8f060" : "#fff",
                transition: "left .2s",
              }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1b19" }}>
                {activo ? "Producto activo" : "Producto inactivo"}
              </p>
              <p style={{ fontSize: 11, color: "#9e9a92", marginTop: 2 }}>
                {activo ? "Visible en el catálogo para compradores" : "No aparece en el catálogo"}
              </p>
            </div>
          </label>
        </Card>
      )}

      {/* feedback de API */}
      {apiError && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "0.5px solid #fecaca" }}>
          ⚠️ {apiError}
        </div>
      )}

      {success && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "0.5px solid #a7f3d0" }}>
          ✓ Producto guardado. Redirigiendo…
        </div>
      )}

      {/* acciones */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: "10px 20px", borderRadius: 9, border: "0.5px solid #d4d2cc", background: "transparent", fontSize: 13, color: "#5f5e5a", cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 24px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#555" : "#111", color: "#c8f060",
            opacity: loading ? .8 : 1, transition: "opacity .15s",
          }}
        >
          {loading ? "Guardando…" : modo === "crear" ? "Publicar producto" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}