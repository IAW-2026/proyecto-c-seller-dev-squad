// ============================================================
// prisma/seed.ts — Seller App
// Datos precargados
//
// Ejecutar con:
//   npx prisma db seed
import { PrismaClient, EstadoVenta } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------
// IMPORTANTE: reemplazá estos IDs con los clerk_user_id reales
// de las cuentas que uses para la demo. Los podés obtener
// desde el dashboard de Clerk → Users.
// ------------------------------------------------------------
const VENDEDORES_SEED = [
  {
    clerkUserId: "user_3DRefS5HUbAbLrWg5SM0lJ4tHAf", 
    nombre: "Brian Crowley",
    email: "brian@seller.com",
    descripcion: "Vendedor oficial de zapatillas de colección y running.",
    avatarUrl: null,
  },
  {
    clerkUserId: "user_seller_002",
    nombre: "Lady Gaga",
    email: "Gaga@seller.com",
    descripcion: "Especialista en zapatillas urbanas y skate.",
    avatarUrl: null,
  },
  {
    clerkUserId: "user_admin_001",
    nombre: "Administrador",
    email: "admin@marketplace.com",
    descripcion: "Cuenta de administración del sistema.",
    avatarUrl: null,
  },
];

const PRODUCTOS_SEED = [
  // --- Brian ---
  {
    vendedorIdx: 0,
    nombre: "Nike Air Max 90",
    descripcion:
      "Clásico de los 90. Amortiguación Air visible, suela de goma, capellada de cuero y mesh.",
    precio: 89999,
    marca: "Nike",
    imagenUrl: null,
    talles: [
      { talle: "40", stock: 3 },
      { talle: "41", stock: 5 },
      { talle: "42", stock: 2 },
      { talle: "43", stock: 1 },
    ],
  },
  {
    vendedorIdx: 0,
    nombre: "Adidas Ultraboost 23",
    descripcion:
      "Running de alto rendimiento. Entresuela BOOST, upper Primeknit, torsion system.",
    precio: 124999,
    marca: "Adidas",
    imagenUrl: null,
        talles: [
      { talle: "39", stock: 4 },
      { talle: "40", stock: 6 },
      { talle: "41", stock: 3 },
      { talle: "42", stock: 2 },
    ],
  },
  {
    vendedorIdx: 0,
    nombre: "New Balance 574",
    descripcion:
      "Ícono del streetwear. Suela ENCAP, parte superior de gamuza y mesh. Muy versátil.",
    precio: 67500,
    marca: "New Balance",
    imagenUrl: null,
    talles: [
      { talle: "41", stock: 8 },
      { talle: "42", stock: 5 },
      { talle: "43", stock: 3 },
    ],
  },
  {
    vendedorIdx: 0,
    nombre: "Jordan 1 Retro High OG",
    descripcion:
      "El original de 1985 re-editado. Cuero premium, suela de goma vulcanizada.",
    precio: 189999,
    marca: "Nike",
    imagenUrl: null,
    talles: [
      { talle: "40", stock: 1 },
      { talle: "41", stock: 2 },
      { talle: "42", stock: 1 },
    ],
  },
  // --- Marta ---
  {
    vendedorIdx: 1,
    nombre: "Vans Old Skool",
    descripcion:
      "El clásico del skate desde 1977. Capellada de lona y gamuza, suela Waffle.",
    precio: 52000,
    marca: "Vans",
    imagenUrl: null,
    talles: [
      { talle: "37", stock: 6 },
      { talle: "38", stock: 4 },
      { talle: "39", stock: 7 },
      { talle: "40", stock: 5 },
    ],
  },
  {
    vendedorIdx: 1,
    nombre: "Converse Chuck Taylor All Star",
    descripcion:
      "El eterno básico. Capellada de lona, puntera de goma, suela vulcanizada.",
    precio: 41999,
    marca: "Converse",
    imagenUrl: null,
    talles: [
      { talle: "36", stock: 5 },
      { talle: "37", stock: 8 },
      { talle: "38", stock: 6 },
      { talle: "39", stock: 4 },
      { talle: "40", stock: 3 },
    ],
  },
  {
    vendedorIdx: 1,
    nombre: "Puma Suede Classic",
    descripcion:
      "Diseño limpio de gamuza. Icónico desde los años 60, favorito del streetwear.",
    precio: 58500,
    marca: "Puma",
    imagenUrl: null,
    talles: [
      { talle: "40", stock: 4 },
      { talle: "41", stock: 3 },
      { talle: "42", stock: 2 },
    ],
  },
  {
    vendedorIdx: 1,
    nombre: "Reebok Classic Leather",
    descripcion:
      "Cuero suave con suela de goma de baja densidad. Cómodo para todo el día.",
    precio: 63000,
    marca: "Reebok",
    imagenUrl: null,
    talles: [
      { talle: "38", stock: 2 },
      { talle: "39", stock: 5 },
      { talle: "40", stock: 4 },
      { talle: "41", stock: 3 },
    ],
  },
];

// Ventas con distintos estados para que el panel se vea completo
const VENTAS_SEED = [
  {
    vendedorIdx: 0,
    ordenId: "orden-buyer-uuid-001",
    total: 89999,
    estado: EstadoVenta.CONFIRMADO,
    detalles: [{ productoIdx: 0, cantidad: 1, precioUnitario: 89999, talle: "42" }],
  },
  {
    vendedorIdx: 0,
    ordenId: "orden-buyer-uuid-002",
    total: 249998,
    estado: EstadoVenta.CONFIRMADO,
    detalles: [
      { productoIdx: 1, cantidad: 1, precioUnitario: 124999, talle: "41" },
      { productoIdx: 2, cantidad: 1, precioUnitario: 67500,  talle: "41" },
      // redondeado al total
    ],
  },
  {
    vendedorIdx: 0,
    ordenId: "orden-buyer-uuid-003",
    total: 189999,
    estado: EstadoVenta.PENDIENTE,
    detalles: [{ productoIdx: 3, cantidad: 1, precioUnitario: 189999, talle: "40" }],
  },
  {
    vendedorIdx: 0,
    ordenId: "orden-buyer-uuid-004",
    total: 89999,
    estado: EstadoVenta.CANCELADO,
    detalles: [{ productoIdx: 0, cantidad: 1, precioUnitario: 89999, talle: "43" }],
  },
  {
    vendedorIdx: 1,
    ordenId: "orden-buyer-uuid-005",
    total: 93999,
    estado: EstadoVenta.CONFIRMADO,
    detalles: [
      { productoIdx: 4, cantidad: 1, precioUnitario: 52000, talle: "38" },
      { productoIdx: 5, cantidad: 1, precioUnitario: 41999, talle: "38" },
    ],
  },
  {
    vendedorIdx: 1,
    ordenId: "orden-buyer-uuid-006",
    total: 58500,
    estado: EstadoVenta.CONFIRMADO,
    detalles: [{ productoIdx: 6, cantidad: 1, precioUnitario: 58500, talle: "40" }],
  },
  {
    vendedorIdx: 1,
    ordenId: "orden-buyer-uuid-007",
    total: 126000,
    estado: EstadoVenta.PENDIENTE,
    detalles: [{ productoIdx: 7, cantidad: 2, precioUnitario: 63000, talle: "39" }],
  },
];

// ------------------------------------------------------------

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpiar en orden (respetando FK)
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.productoTalle.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.vendedor.deleteMany();

  // 1. Vendedores
  const vendedores = await Promise.all(
    VENDEDORES_SEED.map((v) =>
      prisma.vendedor.create({ data: v })
    )
  );
  console.log(`✅ ${vendedores.length} vendedores creados`);

  // 2. Productos + talles
  const productos = await Promise.all(
    PRODUCTOS_SEED.map(({ vendedorIdx, talles, ...data }) =>
      prisma.producto.create({
        data: {
          ...data,
          precio: data.precio,
          vendedorId: vendedores[vendedorIdx].id,
          talles: {
            create: talles,
          },
        },
      })
    )
  );
  console.log(`✅ ${productos.length} productos creados`);

  // 3. Ventas + detalles
  const ventas = await Promise.all(
    VENTAS_SEED.map(({ vendedorIdx, detalles, ...data }) =>
      prisma.venta.create({
        data: {
          ...data,
          vendedorId: vendedores[vendedorIdx].id,
          detalles: {
            create: detalles.map(({ productoIdx, ...d }) => ({
              ...d,
              productoId: productos[productoIdx].id,
            })),
          },
        },
      })
    )
  );
  console.log(`✅ ${ventas.length} ventas creadas`);

  console.log("\n🎉 Seed completado. Credenciales de acceso:");
  console.log("   Vendedor 1 → brian@seller.com");
  console.log("   Vendedor 2 → marta@seller.com");
  console.log("   Admin      → admin@marketplace.com");
  console.log(
    "\n   ⚠️  Recordá actualizar los clerkUserId en seed.ts con los IDs reales de tu dashboard de Clerk."
  );
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());