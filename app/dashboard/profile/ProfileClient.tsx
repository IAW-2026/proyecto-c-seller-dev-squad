"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  seller: {
    name: string;
    email: string;
    description: string | null;
    avatarUrl: string | null;
  };
}

export default function ProfileClient({ seller }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState(seller.description ?? "");
  const [avatarUrl, setAvatarUrl]     = useState(seller.avatarUrl ?? "");
  const [preview, setPreview]         = useState(seller.avatarUrl ?? "");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  function handleAvatarChange(val: string) {
    setAvatarUrl(val);
    // Only update preview when the URL looks complete enough
    if (val === "" || val.startsWith("http://") || val.startsWith("https://")) {
      setPreview(val);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, avatarUrl: avatarUrl || null }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSuccess(true);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="products-page">
      <header className="products-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Mi perfil</h1>
          <p className="dashboard-topbar-date">{seller.name} · {seller.email}</p>
        </div>
      </header>

      <div style={{ padding: "28px", maxWidth: 600 }}>
        {error   && <div className="banner-error">{error}</div>}
        {success && <div className="banner-success">Perfil actualizado correctamente.</div>}

        {/* Avatar */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Foto de perfil</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              {/* Preview circle */}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--muted, #1e1e1e)",
                border: "2px solid var(--border, #2e2e2e)",
                overflow: "hidden", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setPreview("")}
                  />
                ) : (
                  <span style={{ fontSize: 22, opacity: 0.25 }}>
                    {seller.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  Pegá la URL de tu imagen (JPG, PNG, WebP).
                </p>
                <input
                  className="field"
                  type="url"
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  value={avatarUrl}
                  onChange={e => handleAvatarChange(e.target.value)}
                />
              </div>
            </div>
            {avatarUrl && !preview && (
              <p className="text-muted" style={{ fontSize: 11, color: "var(--error, #f87171)" }}>
                No se pudo cargar la imagen. Verificá que la URL sea válida y accesible.
              </p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Descripción pública</span>
          </div>
          <div className="card-body">
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
              Esta descripción aparece en tu perfil del marketplace.
            </p>
            <textarea
              className="field"
              rows={4}
              maxLength={300}
              placeholder="Contá quién sos, qué vendés, tu especialidad…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <p className="text-muted" style={{ fontSize: 11, marginTop: 6, textAlign: "right" }}>
              {description.length} / 300
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-accent"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}