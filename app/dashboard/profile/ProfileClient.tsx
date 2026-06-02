"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  seller: { name: string; email: string; description: string | null };
}

export default function ProfileClient({ seller }: Props) {
  const router = useRouter();
  const [description, setDescription] = useState(seller.description ?? "");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
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