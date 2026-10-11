import { z } from "zod";

/** Carrito que envía el cliente: solo ids y cantidades, nunca precios. */
export const cartSchema = z
  .array(
    z.object({
      id: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().min(1).max(99),
    })
  )
  .min(1, { error: "El carrito está vacío" });

export type CartInput = z.infer<typeof cartSchema>;

export interface CartLine {
  productId: number;
  quantity: number;
}

export interface PricedLine extends CartLine {
  name: string;
  unitPrice: number;
}

export interface ProductForPricing {
  id: number;
  name: string;
  price: number;
  stock: number | null;
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/** Convierte un importe a la unidad mínima (centavos) sin errores de coma flotante. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Importe con dos decimales como string, el formato que piden PayPal y otras APIs. */
export function formatAmount(amount: number): string {
  return (toCents(amount) / 100).toFixed(2);
}

/** Suma las líneas en centavos para evitar errores de redondeo. */
export function cartTotal(lines: Pick<PricedLine, "unitPrice" | "quantity">[]): number {
  const cents = lines.reduce((acc, line) => acc + toCents(line.unitPrice) * line.quantity, 0);
  return cents / 100;
}

/** Agrupa líneas repetidas del mismo producto. */
export function mergeCartLines(cart: CartInput): CartLine[] {
  const quantities = new Map<number, number>();
  for (const item of cart) {
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Calcula el carrito con los precios de la base de datos y valida que todos
 * los productos existan y tengan stock suficiente.
 */
export function priceCart(cart: CartInput, products: ProductForPricing[]): PricedLine[] {
  return mergeCartLines(cart).map(({ productId, quantity }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new CheckoutError(`El producto ${productId} ya no existe`, 404);
    }
    if ((product.stock ?? 0) < quantity) {
      throw new CheckoutError(`No hay stock suficiente de "${product.name}"`, 409);
    }
    return { productId, quantity, name: product.name, unitPrice: product.price };
  });
}

/** Serializa las líneas en un texto corto ("3x2,7x1") para los metadatos de la pasarela. */
export function encodeCartLines(lines: CartLine[]): string {
  return lines.map((line) => `${line.productId}x${line.quantity}`).join(",");
}

export function decodeCartLines(value: string | null | undefined): CartLine[] {
  if (!value) return [];
  return value
    .split(",")
    .map((chunk) => chunk.trim().split("x").map(Number))
    .filter(
      ([productId, quantity]) =>
        Number.isInteger(productId) && productId > 0 && Number.isInteger(quantity) && quantity > 0
    )
    .map(([productId, quantity]) => ({ productId, quantity }));
}
