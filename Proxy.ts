// Protege todas las rutas bajo /dashboard con Clerk.
// Las rutas de API públicas (GET /api/products, POST /api/sales) quedan abiertas.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute     = createRouteMatcher(["/dashboard/admin(.*)"]);

const isPublicApiRoute = createRouteMatcher([
  "/api/products(.*)", 
  "/api/sales", 
  "/api/sales/(.*)",  
  "/api/generar-descripcion(.*)", // <-- Añadido aquí
  "/onboarding",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  const { sessionClaims } = await auth();

  const role = (sessionClaims?.metadata as any)?.role
            ?? (sessionClaims?.publicMetadata as any)?.role
            ?? (sessionClaims as any)?.role
            ?? null;

  // Solo sellers y admins pueden entrar al dashboard
  const rolesPermitidos = ["seller", "admin"];
  if (role && !rolesPermitidos.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  /* // Solo admins pueden entrar a /dashboard/admin
  if (isAdminRoute(req) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }*/
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};