import prisma from "@/libs/prisma";
import { cartSchema, CheckoutError, priceCart, type PricedLine } from "@/libs/cart";

/**
 * Valida el carrito recibido del cliente y lo calcula con los precios y el
 * stock reales de la base de datos.
 */
export async function loadPricedCart(body: unknown): Promise<PricedLine[]> {
  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    throw new CheckoutError(parsed.error.issues[0]?.message ?? "Carrito inválido");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.map((item) => item.id) } },
    select: { id: true, name: true, price: true, stock: true },
  });

  return priceCart(parsed.data, products);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new CheckoutError("El cuerpo de la petición no es JSON válido");
  }
}
