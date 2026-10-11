import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/libs/prisma";
import { describePaypalError, getPaypal } from "@/libs/paypal";
import { requireUser } from "@/libs/session";
import { gatewayUnavailable, jsonError } from "@/libs/config";

const bodySchema = z.object({ subscriptionId: z.string().min(1).max(64) });

// Tras aprobar la suscripción en PayPal, el navegador llama aquí. El estado se
// consulta en PayPal (no se confía en el cliente) y se guarda en el usuario.
export async function POST(request: Request) {
  const paypal = getPaypal();
  if (!paypal) return gatewayUnavailable("paypal");

  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Falta subscriptionId");

  try {
    const { result: subscription } = await paypal.subscriptions.getSubscription({
      id: parsed.data.subscriptionId,
    });

    const [ownerId, planId] = (subscription.customId ?? "").split(":").map(Number);
    if (ownerId !== session.user.id) {
      return jsonError("La suscripción no pertenece a este usuario", 403);
    }
    if (subscription.status !== "ACTIVE" && subscription.status !== "APPROVED") {
      return jsonError(`La suscripción no está activa (estado: ${subscription.status})`, 402);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionProvider: "paypal",
        status: "ACTIVE",
        startedAt: subscription.startTime ? new Date(subscription.startTime) : new Date(),
        planId: Number.isInteger(planId) && planId > 0 ? planId : null,
      },
    });

    return NextResponse.json({ status: subscription.status });
  } catch (err) {
    console.error("[paypal] Error al activar la suscripción:", describePaypalError(err));
    return jsonError("No se pudo verificar la suscripción en PayPal", 502);
  }
}
