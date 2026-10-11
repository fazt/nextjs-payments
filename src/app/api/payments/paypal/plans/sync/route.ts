import { NextResponse } from "next/server";
import { IntervalUnit, PlanRequestStatus, TenureType } from "@paypal/paypal-server-sdk";
import prisma from "@/libs/prisma";
import { describePaypalError, getPaypal, paypalRest } from "@/libs/paypal";
import { requireAdmin } from "@/libs/session";
import { formatAmount } from "@/libs/cart";
import { gatewayUnavailable, jsonError } from "@/libs/config";

// Crea en PayPal (producto de catálogo + plan de facturación mensual) los
// planes locales que todavía no tienen paypalPlanId. Solo administradores.
export async function POST() {
  const paypal = getPaypal();
  if (!paypal) return gatewayUnavailable("paypal");

  const { error } = await requireAdmin();
  if (error) return error;

  const pending = await prisma.subscriptionPlan.findMany({ where: { paypalPlanId: null } });
  const synced: { id: number; name: string; paypalPlanId: string }[] = [];

  try {
    for (const plan of pending) {
      // El SDK no cubre la API de catálogo, se usa REST directamente.
      const product = await paypalRest<{ id: string }>("/v1/catalogs/products", {
        name: `Plan ${plan.name}`,
        description: plan.description.slice(0, 256),
        type: "SERVICE",
        category: "SOFTWARE",
      });

      const { result } = await paypal.subscriptions.createBillingPlan({
        body: {
          productId: product.id,
          name: `Plan ${plan.name}`,
          description: plan.description.slice(0, 127),
          status: PlanRequestStatus.Active,
          billingCycles: [
            {
              frequency: { intervalUnit: IntervalUnit.Month, intervalCount: 1 },
              tenureType: TenureType.Regular,
              sequence: 1,
              totalCycles: 0, // sin fin hasta que se cancele
              pricingScheme: {
                fixedPrice: { currencyCode: "USD", value: formatAmount(plan.price) },
              },
            },
          ],
          paymentPreferences: {
            autoBillOutstanding: true,
            paymentFailureThreshold: 3,
          },
        },
        prefer: "return=representation",
      });

      if (!result.id) throw new Error(`PayPal no devolvió el id del plan ${plan.name}`);
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { paypalPlanId: result.id },
      });
      synced.push({ id: plan.id, name: plan.name, paypalPlanId: result.id });
    }
  } catch (err) {
    console.error("[paypal] Error sincronizando planes:", describePaypalError(err));
    return jsonError(`No se pudieron sincronizar todos los planes (${synced.length} listos)`, 502);
  }

  return NextResponse.json({ synced });
}
