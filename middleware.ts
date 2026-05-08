// middleware.ts — raíz del proyecto
// Protege todas las rutas bajo /dashboard con Clerk.
// Las rutas de API públicas (GET /api/products, POST /api/sales) quedan abiertas.
// middleware.ts — temporalmente desactivado para desarrollo
export default function middleware() {}

export const config = { matcher: [] };
/*
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/products(.*)",  // Buyer App consume esto sin auth de usuario
  "/api/sales",         // POST desde Payments App (auth por secret header en Etapa 3)
  "/api/sales/(.*)",    // GET desde Shipping App
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return; // dejar pasar sin verificar
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
*/