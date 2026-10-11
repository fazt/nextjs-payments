import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import {
  getMercadoPago,
  getMercadoPagoBaseUrl,
  getMercadoPagoCurrency,
  isPublicHttpsUrl,
} from "@/libs/mercadopago";
import { requireUser } from "@/libs/session";
import { loadPricedCart, readJson } from "@/libs/checkout";
import { CheckoutError, encodeCartLines } from "@/libs/cart";
import { gatewayUnavailable, jsonError } from "@/libs/config";

// Crea una preferencia de Checkout Pro con los precios de la base de datos.
export async function POST(request: Request) {
  const mercadopago = getMercadoPago();
  if (!mercadopago) return gatewayUnavailable("mercadopago");

  const { session, error } = await requireUser();
  if (error) return error;

  try {
    const lines = await loadPricedCart(await readJson(request));
    const baseUrl = getMercadoPagoBaseUrl();
    const isPublic = isPublicHttpsUrl(baseUrl);

    const preference = await new Preference(mercadopago).create({
      body: {
        items: lines.map((line) => ({
          id: String(line.productId),
          title: line.name,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          currency_id: getMercadoPagoCurrency(),
        })),
        back_urls: {
          success: `${baseUrl}/mercadopago/success`,
          failure: `${baseUrl}/mercadopago/failure`,
          pending: `${baseUrl}/mercadopago/pending`,
        },
        // auto_return y notification_url solo funcionan con una URL pública https
        ...(isPublic && {
          auto_return: "approved",
          notification_url: `${baseUrl}/api/payments/mercadopago/webhook`,
        }),
        external_reference: String(session.user.id),
        // Mercado Pago devuelve las claves de metadata en snake_case
        metadata: { user_id: session.user.id, products: encodeCartLines(lines) },
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (err) {
    if (err instanceof CheckoutError) return jsonError(err.message, err.status);
    console.error("[mercadopago] Error al crear la preferencia", err);
    return jsonError("No se pudo iniciar el pago con Mercado Pago", 502);
  }
}
