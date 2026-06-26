import { useState } from "react";

type DatosDescripcion = {
  nombre: string;
  categoria?: string;
  keywords?: string;
  imagen?: string;
};

export function useGenerarDescripcion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generarDescripcion(datos: DatosDescripcion) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generar-descripcion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      // 1. Consumimos el JSON una Sola Vez
      const data = await res.json();

      // 2. Evaluamos si el servidor devolvió un error (ej: status 400 o 500)
      if (!res.ok) {
        throw new Error(data.error || "Error al generar descripción");
      }

      // 3. Si todo salió bien, devolvemos la propiedad que viene de la API
      return data.descripcion as string;

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar la descripción"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    generarDescripcion,
    loading,
    error,
  };
}