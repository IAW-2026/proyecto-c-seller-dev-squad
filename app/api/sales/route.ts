import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      productId,
      quantity,
      size,
      color,
    } = body;

    console.log("BODY RECIBIDO:", {
      productId,
      quantity,
      size,
      color,
    });

    if (!productId) {
      return NextResponse.json(
        { error: "Falta productId" },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: true,
        sizes: true,
      },
    });

    console.log("PRODUCTO ENCONTRADO:", product);

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (!product.active) {
      return NextResponse.json(
        { error: "Producto inactivo" },
        { status: 400 }
      );
    }

    // Si el producto tiene talles, el talle es obligatorio
    if (product.sizes.length > 0 && !size) {
      return NextResponse.json(
        { error: "Debe seleccionar un talle" },
        { status: 400 }
      );
    }

    let selectedSize = null;

    if (product.sizes.length > 0) {
      selectedSize = product.sizes.find(
        (s) => s.size === size
      );

      if (!selectedSize) {
        return NextResponse.json(
          { error: "Talle inexistente" },
          { status: 400 }
        );
      }

      if (selectedSize.stock < quantity) {
        return NextResponse.json(
          { error: "Stock insuficiente para ese talle" },
          { status: 400 }
        );
      }
    } else {
      if (product.stock < quantity) {
        return NextResponse.json(
          { error: "Stock insuficiente" },
          { status: 400 }
        );
      }
    }

    const total = Number(product.price) * quantity;

    const sell = await prisma.sell.create({
      data: {
        orderId: crypto.randomUUID(),
        total,
        status: "PENDING",

        sellerId: product.sellerId,

        details: {
          create: {
            quantity,
            unitPrice: product.price,
            size: size ?? null,
            color: color ?? null,
            productId: product.id,
          },
        },
      },
      include: {
        details: true,
      },
    });

    // Descuenta stock
    if (selectedSize) {
      await prisma.productSize.update({
        where: {
          id: selectedSize.id,
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      // Recalcular stock total del producto
      const updatedSizes = await prisma.productSize.findMany({
        where: {
          productId: product.id,
        },
      });

      const totalStock = updatedSizes.reduce(
        (acc, s) => acc + s.stock,
        0
      );

      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: totalStock,
        },
      });
    } else {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }

    return NextResponse.json(
      sell,
      { status: 201 }
    );

  } catch (error) {
    console.error("ERROR API SALES:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}