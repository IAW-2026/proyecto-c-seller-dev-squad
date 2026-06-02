"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingClient() {
  const router = useRouter();

  useEffect(() => {
    const resolveAuth = async () => {
      try {
        const res = await fetch("/api/auth/resolve");

        const data = await res.json();

        router.replace(data.redirectTo);
      } catch (error) {
        console.error(error);

        router.replace("/sign-in");
      }
    };

    resolveAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />

        <h2 className="text-xl font-semibold">
          Preparando tu panel...
        </h2>

        <p className="text-gray-400 mt-2">
          Estamos verificando tu cuenta.
        </p>
      </div>
    </div>
  );
}