import { NextResponse } from "next/server";
import { z } from "zod";
import { describePaypalError, getPaypal } from "@/libs/paypal";
import { requireUser } from "@/libs/session";
import { fulfillOrder } from "@/libs/orders";
import { gatewayUnavailable, jsonError } from "@/libs/config";

const bodySchema = z.object({ orderId: z.string().min(1).max(64) });

// Cobra una orden de PayPal ya aprobada por el comprador y registra el pedido.
export async function POST(request: Request) {
  const paypal = getPaypal();
  if (!paypal) return gatewayUnavailable("paypal");

  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Falta orderId");
  const { orderId } = parsed.data;

  try {
    const { result: order } = await paypal.orders.getOrder({ id: orderId });
    const unit = order.purchaseUnits?.[0];
    if (unit?.customId !== String(session.user.id)) {
      return jsonError("La orden no pertenece a este usuario", 403);
    }

    const { result: captured } =
      order.status === "COMPLETED"
        ? { result: order }
        : await paypal.orders.captureOrder({ id: orderId, prefer: "return=representation" });

    const capture = captured.purchaseUnits?.[0]?.payments?.captures?.[0];
    if (captured.status !== "COMPLETED" || !capture?.id) {
      return jsonError(`El pago no se completó (estado: ${captured.status ?? "desconocido"})`, 402);
    }

    const lines = (unit.items ?? [])
      .map((item) => ({ productId: Number(item.sku), quantity: Number(item.quantity) }))
      .filter((line) => Number.isInteger(line.productId) && line.quantity > 0);

    const { orderId: localOrderId } = await fulfillOrder({
      userId: session.user.id,
      lines,
      provider: "paypal",
      paymentId: capture.id,
      total: Number(capture.amount?.value ?? unit.amount?.value ?? 0),
    });

    return NextResponse.json({ status: captured.status, orderId: localOrderId });
  } catch (err) {
    console.error("[paypal] Error al capturar la orden:", describePaypalError(err));
    return jsonError("No se pudo completar el pago con PayPal", 502);
  }
}
