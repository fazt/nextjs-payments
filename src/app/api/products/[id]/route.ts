import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/libs/session";
import { productApiSchema } from "@/schemas/productSchema";
import { jsonError } from "@/libs/config";

type Ctx = { params: Promise<{ id: string }> };

/** Solo el autor del producto o un admin pueden modificarlo. */
async function loadEditableProduct(ctx: Ctx) {
  const { session, error } = await requireUser();
  if (error) return { error };

  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) || 0 } });
  if (!product) return { error: jsonError("Producto no encontrado", 404) };

  if (product.authorId !== session.user.id && session.user.role !== "admin") {
    return { error: jsonError("No puedes modificar este producto", 403) };
  }
  return { product };
}

export async function PUT(request: Request, ctx: Ctx) {
  const { product, error } = await loadEditableProduct(ctx);
  if (error) return error;

  const parsed = productApiSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
  }
  const { categories, slug, image, ...data } = parsed.data;

  try {
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        ...data,
        ...(slug ? { slug } : {}),
        // Si no se sube una imagen nueva se mantiene la anterior
        ...(image ? { image } : {}),
        categories: {
          deleteMany: {},
          create: categories.map((categoryId) => ({ categoryId })),
        },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") return jsonError("Ya existe un producto con ese slug", 409);
      if (err.code === "P2003") return jsonError("Alguna categoría no existe", 400);
    }
    throw err;
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { product, error } = await loadEditableProduct(ctx);
  if (error) return error;

  try {
    await prisma.product.delete({ where: { id: product.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    // Los productos con pedidos se conservan para no romper el historial
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return jsonError("El producto tiene pedidos asociados y no se puede eliminar", 409);
    }
    return jsonError("No se pudo eliminar el producto", 500);
  }
}
