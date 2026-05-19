"use client";

import { useGenerarDescripcion } from "@/hooks/useGenerarDescripcion";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── tipos ──────────────────────────────────────────────────
interface sizeItem { size: string; stock: number }

interface  productInicial {
  id: string;  name: string; description: string | null; colors: string[]; direction: string | null; price: number;
  stock: number; brand: string; category:string; image: string | null;
  active: boolean; sizes: sizeItem[];
}

interface Props {
  modo: "crear" | "editar";
   productInicial?:  productInicial;
}

const sizes_BASE = ["35","36","37","38","39","40","41","42","43","44","45"];
const brandS = ["Adidas","Converse","New Balance","Nike","Puma","Reebok","Vans","Otra"];
const categories = [
  "Running",
  "Basket",
  "Skate",
  "Lifestyle",
  "Training",
  "Fútbol",
  "Outdoor",
  "Casual",
  "Moda",
  "Otra",
];
const COLORS = [
  "Negro",
  "Blanco",
  "Rojo",
  "Azul",
  "Verde",
  "Gris",
];
// ── helpers de UI ──────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: ".01em" }} className="text-subtle">
      {children}{required && <span className="text-danger" style={{ marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input {...props} className={`field ${error ? "field-error" : ""}`} />
      {error && <p className="field-message-error">{error}</p>}
    </>
  );
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <>
      <textarea {...props} rows={3} className={`field ${error ? "field-error" : ""}`} />
      {error && <p className="field-message-error">{error}</p>}
    </>
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <>
      <select {...props} className={`field ${error ? "field-error" : ""}`}>
        {children}
      </select>
      {error && <p className="field-message-error">{error}</p>}
    </>
  );
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <p className="card-title">{title}</p>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// ── componente principal ───────────────────────────────────
export default function ProductForm({ modo,  productInicial }: Props) {
  const router = useRouter();

  const [ name,      setname]      = useState( productInicial?. name      ?? "");
  const [description, setdescription] = useState( productInicial?.description ?? "");
  const [price,      setprice]      = useState( productInicial?.price?.toString() ?? "");
  const [stock,       setStock]       = useState( productInicial?.stock?.toString()  ?? "0");
  const [brand,       setbrand]       = useState( productInicial?.brand       ?? "");
  const [image,   setimage]   = useState( productInicial?.image   ?? "");
  const [direction, setDirection] = useState(productInicial?.direction ?? "");
  const [colors, setColors] = useState<string[]>(productInicial?.colors ?? []);  
  const [active,setactive]= useState( productInicial?.active?? true);
  const [sizes,      setsizes]      = useState<sizeItem[]>( productInicial?.sizes ?? []);
  const [category, setCategory] = useState(productInicial?.category ?? "");
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const { generarDescripcion, loading: loadingIA, error: errorIA } = useGenerarDescripcion();


  // ── sizes ─────────────────────────────────────────────
  function togglesize(t: string) {
    setsizes((prev) => {
      const existe = prev.find((x) => x.size === t);
      if (existe) return prev.filter((x) => x.size !== t);
      return [...prev, { size: t, stock: 1 }].sort((a, b) => Number(a.size) - Number(b.size));
    });
  }

  function setStocksize(t: string, value: string) {
    setsizes((prev) =>
      prev.map((x) => x.size === t ? { ...x, stock: Math.max(0, Number(value) || 0) } : x)
    );
  }

  // ── validación ─────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (! name.trim())                 e. name    = "El nombre es obligatorio";
    if (!brand)                         e.brand     = "Seleccioná una marca";
    if (!category) e.category = "Seleccioná una categoría";
    if (!price || Number(price) <= 0) e.price    = "Ingresá un precio válido mayor a 0";
    if (Number(stock) < 0)              e.stock     = "El stock no puede ser negativo";
    if (image && !/^https?:\/\/.+/.test(image)) e.image = "La URL debe empezar con http:// o https://";
    return e;
  }

  async function handleGenerarDescripcion() {
  const resultado = await generarDescripcion({
    nombre: name,
    categoria: category,
    keywords: brand,
    imagen: image ?? undefined,
  });
  if (resultado) setdescription(resultado);
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const body = {
       name:       name.trim(),
      description: description?.trim() || null,
      price:      Number(price),
      stock:       Number(stock),
      brand:       brand || null,
      category:    category || null,
      image:   image?.trim() || null,
      direction: direction?.trim() || null,
      colors,
      active,
      sizes,
    };

    setLoading(true);
    try {
      const url    = modo === "crear" ? "/api/products" : `/api/products/${ productInicial!.id}`;
      const method = modo === "crear" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ocurrió un error al guardar el  producto");
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

      {/* ── Información básica ── */}
      <Card title="Información básica">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          <div style={{ gridColumn: "1 / -1" }}>
            <Label required>Nombre</Label>
            <Input
              value={ name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Ej: Nike Air Max 90"
              error={errors. name}
            />
          </div>

          <div>
            <Label required>Marca</Label>
            <Select value={brand} onChange={(e) => setbrand(e.target.value)} error={errors.brand}>
              <option value="">Seleccioná una marca</option>
              {brandS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div>
 
 
          <Label required>Categoría</Label>

            <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
          >
            <option value="">Seleccioná una categoría</option>

            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

          <div>
            <Label required>Precio (ARS)</Label>
            <Input
              type="number" min="0" step="0.01"
              value={price}
              onChange={(e) => setprice(e.target.value)}
              placeholder="89999"
              error={errors.price}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <Label>Descripción</Label>
              <button
                type="button"
                onClick={handleGenerarDescripcion}
                disabled={loadingIA || !name.trim()}
                className="btn-outline"
                style={{ fontSize: 11, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}
              >
                  {loadingIA
                      ? "Generando..."
                      : description
                      ? "🔄 Regenerar"
                      : "✨ Generar con IA"}
                </button>
              </div>
            {errorIA && <p className="field-message-error">{errorIA}</p>}
            <Textarea
              value={description ?? ""}
              onChange={(e) => setdescription(e.target.value)}
              placeholder="Describí el producto: materiales, características, etc."
              error={errors.description}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Label>URL de imagen</Label>
            <Input
              type="url"
              value={image ?? ""}
              onChange={(e) => setimage(e.target.value)}
              placeholder="https://..."
              error={errors.image}
            />
            {image && /^https?:\/\/.+/.test(image) && (
              <div style={{ marginTop: 10, width: 80, height: 80, borderRadius: 10, overflow: "hidden" }} className="border-soft" >
                <img src={image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Label>Dirección</Label>
            <Input
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="Ej: Av. Colón 1234, Bahía Blanca"
            />
            <p className="text-faint" style={{ fontSize: 11, marginTop: 6 }}>
              Dirección donde se retira o vende el producto.
            </p>
          </div>

        </div>
      </Card>
        <Card title="Colores disponibles">
          <Label>Seleccioná los colores</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>

              {COLORS.map((c) => {
                const selected = colors.includes(c);

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColors((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : [...prev, c]
                      );
                    }}
                    className={`talle-toggle ${selected ? "selected" : ""}`}
                  >
                    {c}
                  </button>
                );
              })}

            </div>

            <p className="text-faint" style={{ fontSize: 11, marginTop: 10 }}>
              Elegí uno o más colores para este producto.
            </p>
      </Card>
      {/* ── Stock y sizes ── */}
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
          <p className="text-faint" style={{ fontSize: 11, marginTop: 6 }}>
            Se usa como stock total si no cargás talles individuales.
          </p>
        </div>

        <div>
          <Label>Talles disponibles</Label>
          <p className="text-faint" style={{ fontSize: 11, marginBottom: 12 }}>
            Seleccioná los talles y ajustá el stock por talla.
          </p>

          {/* selector de sizes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {sizes_BASE.map((t) => {
              const seleccionado = sizes.some((x) => x.size === t);
              return (
                <button
                  key={t} type="button"
                  onClick={() => togglesize(t)}
                  className={`talle-toggle ${seleccionado ? "selected" : ""}`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* stock por size */}
          {sizes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {sizes.map(({ size, stock: st }) => (
                <div key={size} className="bg-wash" style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 9, padding: "10px 14px" }}>
                  <span className="text-strong" style={{ fontSize: 13, fontWeight: 600, minWidth: 28 }}>
                    {size}
                  </span>
                  <input
                    type="number" min="0" value={st}
                    onChange={(e) => setStocksize(size, e.target.value)}
                    className="field"
                    style={{ width: "100%", padding: "6px 10px" }}
                  />
                  <span className="text-faint" style={{ fontSize: 11, flexShrink: 0 }}>u.</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </Card>

      {/* ── Visibilidad (solo edición) ── */}
      {modo === "editar" && (
        <Card title="Visibilidad">
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div
              onClick={() => setactive((v) => !v)}
              className={`toggle-track ${active ? "on" : ""}`}
            >
              <div className="toggle-thumb" />
            </div>
            <div>
              <p className="text-strong" style={{ fontSize: 13, fontWeight: 600 }}>
                {active ? " Producto activo" : " Producto inactivo"}
              </p>
              <p className="text-faint" style={{ fontSize: 11, marginTop: 2 }}>
                {active ? "Visible en el catálogo para compradores" : "No aparece en el catálogo"}
              </p>
            </div>
          </label>
        </Card>
      )}

      {/* ── Feedback de API ── */}
      {apiError && <div className="banner-error">⚠️ {apiError}</div>}
      {success  && <div className="banner-success">✓  producto guardado. Redirigiendo…</div>}

      {/* ── Acciones ── */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-accent" style={{ opacity: loading ? 0.8 : 1 }}>
          {loading ? "Guardando…" : modo === "crear" ? "Publicar  producto" : "Guardar cambios"}
        </button>
      </div>

    </form>
  );
}