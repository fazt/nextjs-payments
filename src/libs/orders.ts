import prisma from "@/libs/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { CartLine } from "@/libs/cart";
import type { GatewayId } from "@/libs/config";

interface FulfillOrderInput {
  userId: number;
  lines: CartLine[];
  provider: GatewayId;
  /** id del pago en la pasarela; garantiza que un webhook repetido no duplique el pedido */
  paymentId: string;
  /** importe cobrado por la pasarela */
  total: number;
}

/**
 * Registra un pago aprobado: crea el pedido con su detalle, guarda el pago y
 * descuenta el stock en una sola transacción. Es idempotente por
 * (provider, paymentId).
 */
export async function fulfillOrder(input: FulfillOrderInput) {
  const { userId, lines, provider, paymentId, total } = input;

  const existing = await prisma.payments.findUnique({
    where: { provider_paymentId: { provider, paymentId } },
  });
  if (existing) return { created: false, orderId: existing.orderId };

  try {
    return await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: lines.map((line) => line.productId) } },
      });
      const found = lines.filter((line) => products.some((p) => p.id === line.productId));

      const order = await tx.order.create({
        data: {
          userId,
          total,
          orderDetails: {
            create: found.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              price: products.find((p) => p.id === line.productId)!.price,
            })),
          },
        },
      });

      await tx.payments.create({
        data: { total, userId, orderId: order.id, provider, paymentId },
      });

      for (const line of found) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }

      return { created: true, orderId: order.id };
    });
  } catch (error) {
    // Dos notificaciones simultáneas del mismo pago: la segunda choca con el
    // índice único y se considera ya procesada.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { created: false, orderId: null };
    }
    throw error;
  }
}

/** Registra un cobro de suscripción (sin pedido asociado). Idempotente. */
export async function recordSubscriptionPayment(input: {
  userId: number;
  provider: GatewayId;
  paymentId: string;
  total: number;
}) {
  try {
    await prisma.payments.create({ data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }
}
