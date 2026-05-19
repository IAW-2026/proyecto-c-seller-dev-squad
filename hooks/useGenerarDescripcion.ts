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
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      const res = await fetch("/api/generar-descripcion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar descripción");
      }

      const data = await res.json();

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