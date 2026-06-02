import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32 }}>🚫</p>
        <h1 className="dashboard-topbar-title" style={{ marginTop: 12 }}>
          Acceso prohibido o Cuenta desactivada
        </h1>
        <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
          Si tu cuenta fue desactivada, contacta al administrador.
        </p>
         <SignOutButton redirectUrl="/sign-in">
          <button className="btn-primary" style={{ marginTop: 24 }}>
            Volver al inicio
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}