import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";
 
interface Props { params: { id: string } }
 
export default async function EditProductPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
 
  const vendedor = await prisma.vendedor.findUnique({ where: { clerkUserId: userId } });
  if (!vendedor) redirect("/sign-in");
 
  const producto = await prisma.producto.findFirst({
    where: { id: params.id, vendedorId: vendedor.id },
    include: { talles: true },
  });
  if (!producto) notFound();
 
  return (
    <div className="bg-wash" style={{ minHeight: "100vh" }}>
      <header className="bg-wash border-muted" style={{ padding: "16px 28px", borderBottom: "0.5px solid", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 className="text-strong" style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>
          Editar producto
        </h1>
        <p className="text-faint" style={{ fontSize: 11, marginTop: 2 }}>
          {producto.nombre}
        </p>
      </header>
 
      <div style={{ padding: "28px", maxWidth: 700, margin: "0 auto" }}>
        <ProductForm
          modo="editar"
          productoInicial={{
            id:          producto.id,
            nombre:      producto.nombre,
            descripcion: producto.descripcion ?? "",
            precio:      Number(producto.precio),
            stock:       producto.stock,
            marca:       producto.marca ?? "",
            imagenUrl:   producto.imagenUrl ?? "",
            activo:      producto.activo,
            talles:      producto.talles.map((t) => ({ talle: t.talle, stock: t.stock })),
          }}
        />
      </div>
    </div>
  );
}
 