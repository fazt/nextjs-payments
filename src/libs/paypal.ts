import {
  ApiError,
  Client,
  Environment,
  OrdersController,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";

const SANDBOX_API_URL = "https://api-m.sandbox.paypal.com";

/** URL base de la API REST de PayPal (sandbox por defecto). */
export function getPaypalApiUrl(): string {
  return (process.env.PAYPAL_API_URL || SANDBOX_API_URL).replace(/\/+$/, "");
}

export function getPaypalEnvironment(): "sandbox" | "production" {
  return getPaypalApiUrl().includes("sandbox") ? "sandbox" : "production";
}

/** Client ID público que usan los botones del navegador. */
export function getPaypalClientId(): string | null {
  return process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null;
}

interface PaypalControllers {
  orders: OrdersController;
  subscriptions: SubscriptionsController;
}

let controllers: PaypalControllers | null = null;

/** Controladores del SDK oficial o null si faltan las credenciales. */
export function getPaypal(): PaypalControllers | null {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (!controllers) {
    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment:
        getPaypalEnvironment() === "sandbox" ? Environment.Sandbox : Environment.Production,
      timeout: 15_000,
    });
    controllers = {
      orders: new OrdersController(client),
      subscriptions: new SubscriptionsController(client),
    };
  }
  return controllers;
}

/** Mensaje legible de un error del SDK de PayPal. */
export function describePaypalError(error: unknown): string {
  if (error instanceof ApiError) {
    const body = typeof error.body === "string" ? error.body : "";
    return `PayPal respondió ${error.statusCode}${body ? `: ${body.slice(0, 300)}` : ""}`;
  }
  return error instanceof Error ? error.message : String(error);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Token OAuth para los endpoints REST que el SDK no cubre (catálogo de
 * productos y verificación de webhooks).
 */
export async function getPaypalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${getPaypalApiUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`PayPal OAuth respondió ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(data.expires_in - 60, 0) * 1000,
  };
  return data.access_token;
}

/** Llamada autenticada a la API REST de PayPal. */
export async function paypalRest<T>(path: string, body: unknown): Promise<T> {
  const token = await getPaypalAccessToken();
  const response = await fetch(`${getPaypalApiUrl()}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal ${path} respondió ${response.status}: ${text.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

/**
 * Verifica la firma de un webhook con /v1/notifications/verify-webhook-signature.
 * Requiere PAYPAL_WEBHOOK_ID (el id del webhook en el panel de developer de PayPal).
 */
export async function verifyPaypalWebhook(
  headers: Headers,
  event: unknown,
  webhookId: string
): Promise<boolean> {
  const result = await paypalRest<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    }
  );
  return result.verification_status === "SUCCESS";
}
