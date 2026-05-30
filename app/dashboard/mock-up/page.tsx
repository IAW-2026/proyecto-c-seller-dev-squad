"use client";

import { useEffect, useState } from "react";

export default function MockShop() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.data);
      });
  }, []);

  async function comprar(product: any) {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        size: product.sizes?.[0]?.size ?? null,
        color: product.colors?.[0] ?? null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Compra realizada");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Tienda Demo</h1>

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h3>{p.name}</h3>

          <p>{p.brand}</p>

          <p>${p.price}</p>

          <p>Stock: {p.stock}</p>

          <button
            onClick={() => comprar(p)}
          >
            Comprar
          </button>
        </div>
      ))}
    </div>
  );
}