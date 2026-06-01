import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Inicializamos el cliente oficial de Gemini
// Si no pasas parámetros, busca automáticamente process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { nombre, categoria, keywords, imagen } = body;

    // Validaciones básicas
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El nombre de la zapatilla es requerido" },
        { status: 400 }
      );
    }

    if (nombre.length > 120) {
      return NextResponse.json(
        { error: "Nombre demasiado largo" },
        { status: 400 }
      );
    }

    const prompt = `
Generá una descripción breve, atractiva y persuasiva para una tienda online de calzado.

Reglas estrictas:
- Máximo 80 palabras.
- Tono profesional, moderno y enfocado en la venta de zapatillas.
- Resaltar los beneficios (comodidad, estilo, durabilidad, rendimiento) según el tipo de zapatilla.
- No uses emojis.
- No uses títulos de ningún tipo.
- No inventes características técnicas específicas que no estén en los datos (ej: si no dice "cámara de aire", no lo pongas).
- Devuelve directamente el texto listo para publicar.

Datos del producto:
- Nombre del modelo: ${nombre}
${categoria ? `- Estilo/Categoría: ${categoria}` : ""}
${keywords ? `- Características clave / Marca: ${keywords}` : ""}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const descripcion = response.text;

    return NextResponse.json({
      descripcion,
    });

  } catch (error) {
    console.error("ERROR EN API GEMINI:", error);

    return NextResponse.json(
      { error: "Error interno al generar la descripción con Gemini" },
      { status: 500 }
    )
  }
}