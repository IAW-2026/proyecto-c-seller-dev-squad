import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: Request,
  { params }: Params
) {

  const apiKey = req.headers.get("X-API-Key");

  if (
        apiKey !== process.env.INTERNAL_API_KEY
    ) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    }

  const { id } = await params;

  const seller = await prisma.seller.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatarUrl: true,
      active: true,
    },
  });

  if (!seller) {
    return NextResponse.json(
      { error: "Seller no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(seller);
}