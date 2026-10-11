import { NextResponse } from "next/server";
import {
  InvalidWebhookSignatureError,
  MPNotFoundError,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago";
import { getMercadoPago } from "@/libs/mercadopago";
import { fulfillOrder } from "@/libs/orders";
import { decodeCartLines } from "@/libs/cart";
import { gatewayUnavailable, jsonError } from "@/libs/config";

interface MercadoPagoNotification {
  type?: string;
  action?: string;
  data?: { id?: string | number };
}

// Webhook de Mercado Pago (Tus integraciones > Webhooks, evento "Pagos").
export async function POST(request: Request) {
  const mercadopago = getMercadoPago();
  if (!mercadopago) return gatewayUnavailable("mercadopago");

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET_KEY;
  if (!secret) {
    return jsonError("MERCADOPAGO_WEBHOOK_SECRET_KEY no está configurado", 503);
  }

  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as MercadoPagoNotification;
  const dataId = url.searchParams.get("data.id") ?? body.data?.id?.toString() ?? null;
  const type = url.searchParams.get("type") ?? body.type;

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 600,
    });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      return jsonError(`Firma inválida (${err.reason})`, 401);
    }
    throw err;
  }

  // Solo interesan los pagos; el resto de temas se confirma sin procesar.
  if (type !== "payment" || !dataId) return NextResponse.json({ received: true });

  try {
    // Se consulta el pago en la API en lugar de confiar en la notificación.
    const payment = await new Payment(mercadopago).get({ id: dataId });
    if (payment.status !== "approved") return NextResponse.json({ received: true });

    const userId = Number(payment.metadata?.user_id ?? payment.external_reference);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ received: true, ignored: "sin usuario" });
    }

    await fulfillOrder({
      userId,
      lines: decodeCartLines(payment.metadata?.products),
      provider: "mercadopago",
      paymentId: String(payment.id),
      total: payment.transaction_amount ?? 0,
    });
  } catch (err) {
    // El simulador de webhooks del panel envía ids que no existen
    if (err instanceof MPNotFoundError) {
      return NextResponse.json({ received: true, ignored: "pago no encontrado" });
    }
    console.error("[mercadopago] Error procesando el pago", err);
    return jsonError("Error procesando el pago", 500);
  }

  return NextResponse.json({ received: true });
}
