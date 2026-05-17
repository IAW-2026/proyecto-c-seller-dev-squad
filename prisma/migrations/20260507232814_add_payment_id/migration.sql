-- CreateEnum
CREATE TYPE "SellStatus" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateTable
CREATE TABLE " sellers" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    " name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT " sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE " products" (
    "id" TEXT NOT NULL,
    " name" TEXT NOT NULL,
    "description" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "brand" TEXT,
    "imagen_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt_en" TIMESTAMP(3) NOT NULL,
    " seller_id" TEXT NOT NULL,

    CONSTRAINT " products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE " product_sizes" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    " product_id" TEXT NOT NULL,

    CONSTRAINT " product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "SellStatus" NOT NULL DEFAULT 'PENDIENTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt_en" TIMESTAMP(3) NOT NULL,
    " seller_id" TEXT NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "details_venta" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "size" TEXT,
    "venta_id" TEXT NOT NULL,
    " product_id" TEXT NOT NULL,

    CONSTRAINT "details_venta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX " sellers_clerk_user_id_key" ON " sellers"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX " sellers_email_key" ON " sellers"("email");

-- CreateIndex
CREATE UNIQUE INDEX " product_sizes_ product_id_size_key" ON " product_sizes"(" product_id", "size");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_orden_id_key" ON "ventas"("orden_id");

-- AddForeignKey
ALTER TABLE " products" ADD CONSTRAINT " products_ seller_id_fkey" FOREIGN KEY (" seller_id") REFERENCES " sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE " product_sizes" ADD CONSTRAINT " product_sizes_ product_id_fkey" FOREIGN KEY (" product_id") REFERENCES " products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_ seller_id_fkey" FOREIGN KEY (" seller_id") REFERENCES " sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "details_venta" ADD CONSTRAINT "details_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "details_venta" ADD CONSTRAINT "details_venta_ product_id_fkey" FOREIGN KEY (" product_id") REFERENCES " products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
