import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { getPaypal, verifyPaypalWebhook } from "@/libs/paypal";
import { recordSubscriptionPayment } from "@/libs/orders";
import { gatewayUnavailable, jsonError } from "@/libs/config";

interface PaypalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status?: string;
    custom_id?: string;
    billing_agreement_id?: string;
    amount?: { total?: string; value?: string };
  };
}

// Webhook de PayPal para suscripciones. Configura la URL
// https://TU-DOMINIO/api/checkout/paypal/webhooks en el panel de developer y
// guarda su id en PAYPAL_WEBHOOK_ID.
export async function POST(request: Request) {
  if (!getPaypal()) return gatewayUnavailable("paypal");

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return jsonError("PAYPAL_WEBHOOK_ID no está configurado; no se puede verificar el webhook", 503);
  }

  const event = (await request.json().catch(() => null)) as PaypalWebhookEvent | null;
  if (!event?.event_type || !event.resource) return jsonError("Evento inválido");

  try {
    const valid = await verifyPaypalWebhook(request.headers, event, webhookId);
    if (!valid) return jsonError("Firma del webhook inválida", 401);
  } catch (err) {
    console.error("[paypal] No se pudo verificar el webhook", err);
    return jsonError("No se pudo verificar el webhook", 502);
  }

  try {
    const { resource } = event;
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await updateSubscription(resource.id, { status: "ACTIVE" });
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await updateSubscription(resource.id, { status: "SUSPENDED" });
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await updateSubscription(resource.id, {
          status: event.event_type.endsWith("EXPIRED") ? "EXPIRED" : "CANCELLED",
          subscriptionId: null,
          subscriptionProvider: null,
          planId: null,
        });
        break;
      case "PAYMENT.SALE.COMPLETED": {
        // Cobro recurrente de una suscripción
        const subscriptionId = resource.billing_agreement_id;
        if (!subscriptionId) break;
        const user = await prisma.user.findFirst({ where: { subscriptionId } });
        if (!user) break;
        await recordSubscriptionPayment({
          userId: user.id,
          provider: "paypal",
          paymentId: resource.id,
          total: Number(resource.amount?.total ?? resource.amount?.value ?? 0),
        });
        break;
      }
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        console.warn(`[paypal] Falló el cobro de la suscripción ${resource.id}`);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[paypal] Error procesando ${event.event_type}`, err);
    return jsonError("Error procesando el evento", 500);
  }

  return NextResponse.json({ received: true });
}

async function updateSubscription(
  subscriptionId: string,
  data: {
    status: string;
    subscriptionId?: null;
    subscriptionProvider?: null;
    planId?: null;
  }
) {
  await prisma.user.updateMany({ where: { subscriptionId }, data });
}
