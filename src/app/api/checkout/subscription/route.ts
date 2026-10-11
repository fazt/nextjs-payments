import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/libs/prisma";
import { getStripe } from "@/libs/stripe";
import { requireUser } from "@/libs/session";
import { toCents } from "@/libs/cart";
import { gatewayUnavailable, getAppUrl, jsonError } from "@/libs/config";

const bodySchema = z.object({ planId: z.coerce.number().int().positive() });

// Crea una sesión de Stripe Checkout en modo suscripción para un plan.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return gatewayUnavailable("stripe");

  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Indica el plan (planId)");

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan) return jsonError("El plan no existe", 404);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.subscriptionId && user.status === "ACTIVE") {
    return jsonError("Ya tienes una suscripción activa. Cancélala antes de cambiar de plan.", 409);
  }

  const metadata = { userId: String(session.user.id), planId: String(plan.id) };
  const appUrl = getAppUrl();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      // Si el plan no tiene un Price creado en Stripe se define al vuelo.
      line_items: [
        plan.stripePriceId
          ? { price: plan.stripePriceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: toCents(plan.price),
                recurring: { interval: "month" },
                product_data: { name: `Plan ${plan.name}` },
              },
            },
      ],
      customer_email: session.user.email || undefined,
      client_reference_id: String(session.user.id),
      metadata,
      subscription_data: { metadata },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscriptions`,
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe] Error al crear la suscripción", err);
    return jsonError("No se pudo iniciar la suscripción con Stripe", 502);
  }
}
