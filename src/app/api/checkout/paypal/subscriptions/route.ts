import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/libs/prisma";
import { describePaypalError, getPaypal } from "@/libs/paypal";
import { requireUser } from "@/libs/session";
import { gatewayUnavailable, getAppUrl, jsonError } from "@/libs/config";

const bodySchema = z.object({ planId: z.coerce.number().int().positive() });

// Crea una suscripción de PayPal para un plan (el botón de suscripción la aprueba).
export async function POST(request: Request) {
  const paypal = getPaypal();
  if (!paypal) return gatewayUnavailable("paypal");

  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Indica el plan (planId)");

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan) return jsonError("El plan no existe", 404);
  if (!plan.paypalPlanId) {
    return jsonError(
      "Este plan aún no está sincronizado con PayPal (panel > Suscripciones > Sincronizar con PayPal)",
      409
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.subscriptionId && user.status === "ACTIVE") {
    return jsonError("Ya tienes una suscripción activa. Cancélala antes de cambiar de plan.", 409);
  }

  try {
    const appUrl = getAppUrl();
    const { result } = await paypal.subscriptions.createSubscription({
      body: {
        planId: plan.paypalPlanId,
        // custom_id enlaza la suscripción con el usuario en los webhooks
        customId: `${session.user.id}:${plan.id}`,
        applicationContext: {
          brandName: "Next Payments",
          returnUrl: `${appUrl}/dashboard/profile`,
          cancelUrl: `${appUrl}/subscriptions`,
        },
      },
      prefer: "return=representation",
    });

    return NextResponse.json({ subscriptionId: result.id, status: result.status });
  } catch (err) {
    console.error("[paypal] Error al crear la suscripción:", describePaypalError(err));
    return jsonError("No se pudo crear la suscripción de PayPal", 502);
  }
}
