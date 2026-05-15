import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");

  return (
    <div className="products-page">
      <header className="products-topbar">
        <div>
          <h1 className="dashboard-topbar-title">Nuevo producto</h1>
          <p className="dashboard-topbar-date">Completá los datos para publicar una zapatilla</p>
        </div>
      </header>
      <div style={{ padding: "28px", maxWidth: 700, margin: "0 auto" }}>
        <ProductForm modo="crear" />
      </div>
    </div>
  );
}