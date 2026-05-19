import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";
 
interface Props { params: Promise<{ id: string }> }
 
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
 
  const seller= await prisma.seller.findUnique({ where: { clerkUserId: userId } });
  if (!seller) redirect("/onboarding");
 
  const  product = await prisma.product.findFirst({
    where: { id, sellerId:  seller.id },
    include: { sizes: true },
  });
  if (!product) notFound();
 
  return (
    <div className="bg-wash" style={{ minHeight: "100vh" }}>
      <header className="bg-wash border-muted" style={{ padding: "16px 28px", borderBottom: "0.5px solid", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 className="text-strong" style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>
          Editar producto
        </h1>
        <p className="text-faint" style={{ fontSize: 11, marginTop: 2 }}>
          { product. name}
        </p>
      </header>
 
      <div style={{ padding: "28px", maxWidth: 700, margin: "0 auto" }}>
        <ProductForm
          modo="editar"
           productInicial={{
            id:           product.id,
            name:       product. name,
            description:  product.description ?? null,
            price:      Number( product.price),
            stock:        product.stock,
            brand:        product.brand ?? "",
            category: product.category ?? "",
            direction: product.direction ?? "",
            image:    product.image ?? null,
            colors:     product.colors ?? [],
            active:       product.active,
            sizes:       product.sizes.map((t) => ({ size: t.size, stock: t.stock })),
          }}
        />
      </div>
    </div>
  );
}
 