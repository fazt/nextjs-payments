import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { getStripe } from "@/libs/stripe";
import { describePaypalError, getPaypal } from "@/libs/paypal";
import { requireUser } from "@/libs/session";
import { gatewayUnavailable, jsonError } from "@/libs/config";

// Cancela la suscripción del usuario en la pasarela con la que se suscribió.
export async function POST() {
  const { session, error } = await requireUser();
  if (error) return error;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.subscriptionId) return jsonError("No tienes una suscripción activa", 400);

  try {
    if (user.subscriptionProvider === "paypal") {
      const paypal = getPaypal();
      if (!paypal) return gatewayUnavailable("paypal");
      await paypal.subscriptions.cancelSubscription({
        id: user.subscriptionId,
        body: { reason: "Cancelada por el usuario desde la app" },
      });
    } else {
      const stripe = getStripe();
      if (!stripe) return gatewayUnavailable("stripe");
      await stripe.subscriptions.cancel(user.subscriptionId);
    }
  } catch (err) {
    console.error("[subscriptions] Error al cancelar:", describePaypalError(err));
    return jsonError("La pasarela no pudo cancelar la suscripción", 502);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "CANCELLED", subscriptionId: null, subscriptionProvider: null, planId: null },
  });

  return NextResponse.json({ status: "CANCELLED" });
}
