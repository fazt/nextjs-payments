/**
 * @jest-environment node
 */
import { gatewayUnavailable, getAppUrl, getGatewayStatus } from "@/libs/config";
import { isPublicHttpsUrl } from "@/libs/mercadopago";
import { getPaypalEnvironment } from "@/libs/paypal";
import { getStripe } from "@/libs/stripe";

const KEYS = [
  "STRIPE_SECRET_KEY",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_API_URL",
  "MERCADOPAGO_ACCESS_TOKEN",
  "NEXTAUTH_URL",
];
const original = { ...process.env };

beforeEach(() => {
  for (const key of KEYS) delete process.env[key];
});

afterAll(() => {
  process.env = original;
});

describe("disponibilidad de pasarelas", () => {
  it("sin credenciales todas quedan como no disponibles", () => {
    expect(getGatewayStatus()).toEqual({ stripe: false, paypal: false, mercadopago: false });
    expect(getStripe()).toBeNull();
  });

  it("PayPal necesita client id y secret", () => {
    process.env.PAYPAL_CLIENT_ID = "id";
    expect(getGatewayStatus().paypal).toBe(false);
    process.env.PAYPAL_CLIENT_SECRET = "secret";
    expect(getGatewayStatus().paypal).toBe(true);
  });

  it("detecta Stripe y Mercado Pago por su clave", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-123";
    expect(getGatewayStatus()).toMatchObject({ stripe: true, mercadopago: true });
  });

  it("responde 503 con un mensaje claro cuando falta una pasarela", async () => {
    const response = gatewayUnavailable("mercadopago");
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/Mercado Pago no está disponible/);
  });
});

describe("URLs", () => {
  it("usa NEXTAUTH_URL sin barra final", () => {
    expect(getAppUrl()).toBe("http://localhost:3000");
    process.env.NEXTAUTH_URL = "https://tienda.example.com/";
    expect(getAppUrl()).toBe("https://tienda.example.com");
  });

  it("Mercado Pago solo acepta URLs públicas https para webhooks y auto_return", () => {
    expect(isPublicHttpsUrl("https://abc.trycloudflare.com")).toBe(true);
    expect(isPublicHttpsUrl("http://localhost:3000")).toBe(false);
    expect(isPublicHttpsUrl("https://localhost:3000")).toBe(false);
    expect(isPublicHttpsUrl("no-es-url")).toBe(false);
  });

  it("deduce el entorno de PayPal de PAYPAL_API_URL", () => {
    expect(getPaypalEnvironment()).toBe("sandbox");
    process.env.PAYPAL_API_URL = "https://api-m.paypal.com";
    expect(getPaypalEnvironment()).toBe("production");
  });
});
