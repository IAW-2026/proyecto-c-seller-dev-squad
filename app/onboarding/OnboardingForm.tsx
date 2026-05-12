"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function OnboardingForm() {
  const router = useRouter();
  const [nombre, setNombre]       = useState("");
  const [email, setEmail]         = useState("");
  const [descripcion, setDesc]    = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const { signOut } = useClerk();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, descripcion }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al registrarse");
      }
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 24, fontWeight: 600, color: "var(--color-foreground)", letterSpacing: "-.03em" }}>
            seller<span style={{ color: "var(--color-success)" }}>.</span>
          </p>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginTop: 6 }}>
            Completá tu perfil para empezar a vender
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Crear cuenta de vendedor</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-muted)", marginBottom: 6 }}>
                  Nombre completo <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-muted)", marginBottom: 6 }}>
                  Email <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-muted)", marginBottom: 6 }}>
                  Descripción <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Contá brevemente qué tipo de zapatillas vendés"
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-foreground)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {error && (
                <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", opacity: loading ? .7 : 1 }}
              >
                {loading ? "Registrando…" : "Comenzar a vender"}
                </button>
                <button
                   type="button"
                   onClick={() => signOut({ redirectUrl: "/sign-in" })}
                   style={{ width: "100%", justifyContent: "center", marginTop: 10, padding: "10px", borderRadius: 9, border: "1px solid var(--color-border)", background: "transparent", fontSize: 13, color: "var(--color-muted)", cursor: "pointer" }}
                            >
                   Volver al inicio de sesión
                  </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}