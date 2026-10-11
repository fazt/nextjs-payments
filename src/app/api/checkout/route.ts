import { NextResponse } from "next/server";
import { getStripe } from "@/libs/stripe";
import { requireUser } from "@/libs/session";
import { loadPricedCart, readJson } from "@/libs/checkout";
import { CheckoutError, encodeCartLines, toCents } from "@/libs/cart";
import { gatewayUnavailable, getAppUrl, jsonError } from "@/libs/config";

// Crea una sesión de Stripe Checkout para pagar el carrito.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return gatewayUnavailable("stripe");

  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const lines = await loadPricedCart(await readJson(request));
    const encodedLines = encodeCartLines(lines);
    if (encodedLines.length > 500) {
      return jsonError("El carrito tiene demasiados productos distintos", 400);
    }

    const appUrl = getAppUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      // Sin payment_method_types: Stripe muestra los métodos activos en el
      // Dashboard (el parámetro ya no existe en la API 2026-09-30.endive).
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: toCents(line.unitPrice),
          product_data: { name: line.name },
        },
      })),
      customer_email: session.user.email || undefined,
      client_reference_id: String(session.user.id),
      metadata: {
        userId: String(session.user.id),
        products: encodedLines,
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (err) {
    if (err instanceof CheckoutError) return jsonError(err.message, err.status);
    console.error("[stripe] Error al crear la sesión de checkout", err);
    return jsonError("No se pudo iniciar el pago con Stripe", 502);
  }
}
