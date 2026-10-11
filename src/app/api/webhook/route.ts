import { NextResponse } from "next/server";
import type Stripe from "stripe";
import prisma from "@/libs/prisma";
import { getStripe, toSubscriptionStatus } from "@/libs/stripe";
import { fulfillOrder } from "@/libs/orders";
import { decodeCartLines } from "@/libs/cart";
import { gatewayUnavailable, jsonError } from "@/libs/config";

// Webhook de Stripe. En local: stripe listen --forward-to localhost:3000/api/webhook
export async function POST(request: Request) {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  if (!stripe || !endpointSecret) return gatewayUnavailable("stripe");

  const signature = request.headers.get("stripe-signature");
  if (!signature) return jsonError("Falta la cabecera stripe-signature", 400);

  let event: Stripe.Event;
  try {
    // constructEvent necesita el cuerpo sin parsear
    event = stripe.webhooks.constructEvent(await request.text(), signature, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "firma inválida";
    return jsonError(`Webhook Error: ${message}`, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object);
        break;
      default:
        // Otros eventos se aceptan sin procesar
        break;
    }
  } catch (err) {
    console.error(`[stripe] Error procesando ${event.type}`, err);
    // 500 para que Stripe reintente el evento
    return jsonError("Error procesando el evento", 500);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = Number(session.metadata?.userId ?? session.client_reference_id);
  if (!Number.isInteger(userId) || userId <= 0) return;

  if (session.mode === "payment") {
    // Con métodos asíncronos el pago puede seguir pendiente: se registrará
    // con checkout.session.async_payment_succeeded.
    if (session.payment_status !== "paid") return;

    await fulfillOrder({
      userId,
      lines: decodeCartLines(session.metadata?.products),
      provider: "stripe",
      paymentId: session.id,
      total: (session.amount_total ?? 0) / 100,
    });
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const planId = Number(session.metadata?.planId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId,
        subscriptionProvider: "stripe",
        status: "ACTIVE",
        startedAt: new Date(),
        planId: Number.isInteger(planId) && planId > 0 ? planId : null,
      },
    });

    if (session.amount_total) {
      await prisma.payments.upsert({
        where: { provider_paymentId: { provider: "stripe", paymentId: session.id } },
        update: {},
        create: {
          userId,
          provider: "stripe",
          paymentId: session.id,
          total: session.amount_total / 100,
        },
      });
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({ where: { subscriptionId: subscription.id } });
  if (!user) return;

  const status = toSubscriptionStatus(subscription.status);
  await prisma.user.update({
    where: { id: user.id },
    data:
      status === "CANCELLED"
        ? { status, subscriptionId: null, subscriptionProvider: null, planId: null }
        : { status },
  });
}
