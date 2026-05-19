import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      nombre,
      categoria,
      keywords,
      imagen,
    } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        {
          error: "El nombre es requerido",
        },
        {
          status: 400,
        }
      );
    }

    if (nombre.length > 120) {
      return NextResponse.json(
        {
          error: "Nombre demasiado largo",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = `
Generá una descripción breve y persuasiva para ecommerce.

Reglas:
- Máximo 80 palabras
- Tono profesional y vendedor
- Resaltar beneficios del producto
- No usar emojis
- No usar títulos
- No inventar características
- Texto listo para una tienda online

Datos:
- Nombre: ${nombre}
${categoria ? `- Categoría: ${categoria}` : ""}
${keywords ? `- Marca o keywords: ${keywords}` : ""}
${imagen ? `- Imagen: ${imagen}` : ""}
`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    const descripcion = response.output_text;

    return NextResponse.json({
      descripcion,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      {
        status: 500,
      }
    );
  }
}