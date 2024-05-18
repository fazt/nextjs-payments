import MercadoPagoConfig from "mercadopago";

export const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
  options: { timeout: 5000, idempotencyKey: "abc" },
});
