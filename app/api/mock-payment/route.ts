import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { sellId } = body;

    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );

    const estados = ["CONFIRMED", "CANCELLED"];

    const status =
      estados[Math.floor(Math.random() * estados.length)];

   await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.INTERNAL_API_KEY!,
        },
        body: JSON.stringify({
          sellId,
          status,
        }),
      }
    );

    return NextResponse.json({
      ok: true,
      status,
    });

  } catch (error) {
    console.error("Error mock payment:", error);

    return NextResponse.json(
      { error: "Error mock payment" },
      { status: 500 }
    );
  }
}