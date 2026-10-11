import { MercadoPagoConfig } from "mercadopago";
import { getAppUrl } from "@/libs/config";

let client: MercadoPagoConfig | null = null;

/**
 * Cliente de Mercado Pago o null si falta MERCADOPAGO_ACCESS_TOKEN.
 * No se fija idempotencyKey: el SDK genera una distinta por petición (una clave
 * fija hacía que todas las preferencias compartieran la misma).
 */
export function getMercadoPago(): MercadoPagoConfig | null {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  client ??= new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
  return client;
}

/** Moneda de las preferencias (PEN por defecto, la de una cuenta de Perú). */
export function getMercadoPagoCurrency(): string {
  return process.env.MERCADOPAGO_CURRENCY || "PEN";
}

/** Public key para el Wallet Brick del navegador (opcional). */
export function getMercadoPagoPublicKey(): string | null {
  return process.env.MERCADOPAGO_PUBLIC_KEY || null;
}

/**
 * URL pública desde la que Mercado Pago alcanza la app (back_urls y webhook).
 * Mercado Pago no acepta localhost para auto_return ni para notificaciones, así
 * que en desarrollo se usa un túnel (MERCADOPAGO_BACKEND_URL).
 */
export function getMercadoPagoBaseUrl(): string {
  return (process.env.MERCADOPAGO_BACKEND_URL || getAppUrl()).replace(/\/+$/, "");
}

export function isPublicHttpsUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname !== "localhost" && hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}
