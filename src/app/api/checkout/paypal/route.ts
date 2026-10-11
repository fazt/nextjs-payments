import { NextResponse } from "next/server";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { describePaypalError, getPaypal } from "@/libs/paypal";
import { requireUser } from "@/libs/session";
import { loadPricedCart, readJson } from "@/libs/checkout";
import { cartTotal, CheckoutError, formatAmount } from "@/libs/cart";
import { gatewayUnavailable, jsonError } from "@/libs/config";

const CURRENCY = "USD";

// Crea una orden de PayPal (intent CAPTURE) con los precios de la base de datos.
// El botón de PayPal la aprueba y después /api/checkout/paypal/capture la cobra.
export async function POST(request: Request) {
  const paypal = getPaypal();
  if (!paypal) return gatewayUnavailable("paypal");

  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const lines = await loadPricedCart(await readJson(request));
    const total = formatAmount(cartTotal(lines));

    const { result } = await paypal.orders.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            customId: String(session.user.id),
            amount: {
              currencyCode: CURRENCY,
              value: total,
              breakdown: { itemTotal: { currencyCode: CURRENCY, value: total } },
            },
            items: lines.map((line) => ({
              name: line.name.slice(0, 127),
              sku: String(line.productId),
              quantity: String(line.quantity),
              unitAmount: { currencyCode: CURRENCY, value: formatAmount(line.unitPrice) },
            })),
          },
        ],
      },
      prefer: "return=representation",
    });

    return NextResponse.json({ id: result.id, status: result.status });
  } catch (err) {
    if (err instanceof CheckoutError) return jsonError(err.message, err.status);
    console.error("[paypal] Error al crear la orden:", describePaypalError(err));
    return jsonError("No se pudo crear la orden de PayPal", 502);
  }
}
