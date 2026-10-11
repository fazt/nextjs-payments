import type { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import prisma from "@/libs/prisma";

export const metadata: Metadata = {
  title: "Productos | Next Payments",
};

// Se renderiza en cada petición (stock y precios al día, y el build no necesita BD)
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { created_at: "desc" },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: { select: { name: true } } } },
    },
  });

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Productos</h2>

        {products.length === 0 && (
          <p className="text-center text-gray-500">
            Aún no hay productos. Ejecuta <code>npm run db:seed</code> o créalos desde el panel.
          </p>
        )}

        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                stock: product.stock,
                authorName: product.author.name,
                categories: product.categories.map((c) => c.category.name),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
