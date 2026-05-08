import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductFrom";

export default async function NewProductPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#f6f5f3", minHeight: "100vh" }}>
      <header style={{ padding: "16px 28px", background: "#f6f5f3", borderBottom: "0.5px solid #e2e0dc", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: "#1c1b19", letterSpacing: "-.02em" }}>Nuevo producto</h1>
        <p style={{ fontSize: 11, color: "#9e9a92", marginTop: 2 }}>Completá los datos para publicar una zapatilla</p>
      </header>
      <div style={{ padding: "28px", maxWidth: 700 }}>
        <ProductForm modo="crear" />
      </div>
    </div>
  );
}