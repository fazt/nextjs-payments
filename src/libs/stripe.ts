import Stripe from "stripe";

/**
 * Versión de la API de Stripe con la que está escrita la integración. Coincide
 * con la que fija stripe-node 23; fijarla explícitamente evita que cambie al
 * actualizar el SDK o la versión por defecto de la cuenta.
 */
export const STRIPE_API_VERSION = "2026-09-30.endive" as const;

let stripeClient: Stripe | null = null;

/** Devuelve el cliente de Stripe o null si no hay STRIPE_SECRET_KEY. */
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  stripeClient ??= new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
  return stripeClient;
}

/** Normaliza el estado de una suscripción de Stripe al formato que guarda la app. */
export function toSubscriptionStatus(status: Stripe.Subscription.Status): string {
  return status === "canceled" ? "CANCELLED" : status.toUpperCase();
}
