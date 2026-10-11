import { redirect } from "next/navigation";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";
import { Button } from "@/components/ui";
import ProductTable from "@/components/products/ProductTable";

export const dynamic = "force-dynamic";

export default async function DashboardProductsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const isAdmin = session.user.role === "admin";
  // El admin ve todo el catálogo; cada usuario, sus propios productos
  const products = await prisma.product.findMany({
    where: isAdmin ? {} : { authorId: session.user.id },
    orderBy: { created_at: "desc" },
    include: {
      author: { select: { name: true, last_name: true } },
      categories: { include: { category: true } },
    },
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-100">Productos</h1>
          <p className="mt-2 text-sm text-gray-100">
            {isAdmin ? "Todos los productos de la tienda" : "Tus productos"}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button href="/dashboard/products/new">Crea un producto</Button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black/5 sm:rounded-lg">
              <ProductTable
                products={products.map((product) => ({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  image: product.image,
                  slug: product.slug,
                  author: `${product.author.name} ${product.author.last_name}`,
                  categories: product.categories.map((c) => c.category.name),
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
