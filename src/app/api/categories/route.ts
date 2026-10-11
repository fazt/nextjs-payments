import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { requireAdmin } from "@/libs/session";
import { createCategorySchema } from "@/schemas/categorySchema";
import { jsonError } from "@/libs/config";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = createCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? "",
    },
  });

  return NextResponse.json(category, { status: 201 });
}
