import { NextResponse } from "next/server";

export type GatewayId = "stripe" | "paypal" | "mercadopago";

export type GatewayStatus = Record<GatewayId, boolean>;

export const gatewayNames: Record<GatewayId, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  mercadopago: "Mercado Pago",
};

/** URL pública de la app, usada en las URLs de retorno de las pasarelas. */
export function getAppUrl(): string {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Indica qué pasarelas tienen credenciales en el servidor. Una pasarela sin
 * credenciales se muestra como "no disponible" y sus endpoints responden 503.
 */
export function getGatewayStatus(): GatewayStatus {
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    mercadopago: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
  };
}

export function gatewayUnavailable(gateway: GatewayId) {
  return NextResponse.json(
    { error: `${gatewayNames[gateway]} no está disponible: faltan sus credenciales en el servidor` },
    { status: 503 }
  );
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
