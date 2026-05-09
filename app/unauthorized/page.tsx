import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f6f5f3", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔒</p>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1c1b19", marginBottom: 8 }}>Acceso denegado</h1>
      <p style={{ fontSize: 14, color: "#9e9a92", marginBottom: 24 }}>Tu cuenta no tiene permisos para acceder al panel de vendedores.</p>
      <Link href="/" style={{ fontSize: 13, fontWeight: 500, color: "#111", textDecoration: "underline" }}>
        Volver al inicio
      </Link>
    </div>
  );
}