import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/libs/session";
import { productApiSchema } from "@/schemas/productSchema";
import { jsonError } from "@/libs/config";

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = productApiSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
  }
  const { categories, slug, ...data } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        ...(slug ? { slug } : {}),
        authorId: session.user.id,
        categories: {
          create: categories.map((categoryId) => ({ categoryId })),
        },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") return jsonError("Ya existe un producto con ese slug", 409);
      if (err.code === "P2003") return jsonError("Alguna categoría no existe", 400);
    }
    throw err;
  }
}
