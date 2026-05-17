/*
  Warnings:

  - You are about to drop the `details_venta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the ` product_sizes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the ` products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the ` sellers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ventas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SellStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "details_venta" DROP CONSTRAINT "details_venta_ product_id_fkey";

-- DropForeignKey
ALTER TABLE "details_venta" DROP CONSTRAINT "details_venta_venta_id_fkey";

-- DropForeignKey
ALTER TABLE " product_sizes" DROP CONSTRAINT " product_sizes_ product_id_fkey";

-- DropForeignKey
ALTER TABLE " products" DROP CONSTRAINT " products_ seller_id_fkey";

-- DropForeignKey
ALTER TABLE "ventas" DROP CONSTRAINT "ventas_ seller_id_fkey";

-- DropTable
DROP TABLE "details_venta";

-- DropTable
DROP TABLE " product_sizes";

-- DropTable
DROP TABLE " products";

-- DropTable
DROP TABLE " sellers";

-- DropTable
DROP TABLE "ventas";

-- DropEnum
DROP TYPE "SellStatus";

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sells" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "SellStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "sells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_details" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "size" TEXT,
    "sellId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "sell_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sellers_clerk_user_id_key" ON "sellers"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_email_key" ON "sellers"("email");

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_productId_size_key" ON "product_sizes"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "sells_order_id_key" ON "sells"("order_id");

-- CreateIndex
CREATE INDEX "sells_seller_id_idx" ON "sells"("seller_id");

-- CreateIndex
CREATE INDEX "sell_details_sellId_idx" ON "sell_details"("sellId");

-- CreateIndex
CREATE INDEX "sell_details_productId_idx" ON "sell_details"("productId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sells" ADD CONSTRAINT "sells_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_details" ADD CONSTRAINT "sell_details_sellId_fkey" FOREIGN KEY ("sellId") REFERENCES "sells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_details" ADD CONSTRAINT "sell_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
