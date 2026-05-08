// middleware.ts — raíz del proyecto
// Protege todas las rutas bajo /dashboard con Clerk.
// Las rutas de API públicas (GET /api/products, POST /api/sales) quedan abiertas.
// middleware.ts — temporalmente desactivado para desarrollo
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/products(.*)",
  "/api/sales",
  "/api/sales/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return;
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};