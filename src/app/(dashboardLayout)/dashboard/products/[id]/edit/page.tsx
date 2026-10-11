import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";

export const metadata: Metadata = {
  title: "Editar Producto | Next Payments",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) || 0 },
    include: { categories: { select: { categoryId: true } } },
  });
  if (!product) notFound();
  if (product.authorId !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard/products");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <ProductForm
      categories={categories}
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        slug: product.slug,
        categories: product.categories.map((c) => c.categoryId),
      }}
    />
  );
}
