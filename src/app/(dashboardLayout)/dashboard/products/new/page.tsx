import type { Metadata } from "next";
import ProductForm from "@/components/products/ProductForm";
import prisma from "@/libs/prisma";

export const metadata: Metadata = {
  title: "Crear Producto | Next Payments",
};

export const dynamic = "force-dynamic";

async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} />;
}

export default NewProductPage;
