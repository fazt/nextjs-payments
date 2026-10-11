import prisma from "@/libs/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/libs/session";
import { jsonError } from "@/libs/config";

// En Next.js 15+ `params` es una promesa
export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  try {
    // Las relaciones ProductCategory se borran en cascada
    await prisma.category.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return jsonError("Categoría no encontrada", 404);
    }
    return jsonError("No se pudo eliminar la categoría", 500);
  }
}
