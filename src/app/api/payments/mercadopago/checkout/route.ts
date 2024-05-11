import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-2194507011038802-052423-240ca9f686e609f5eea5d7ddaea295c0-1382317927",
  options: { timeout: 5000, idempotencyKey: "abc" },
});

export async function POST() {
  const preferenceBody = {
    items: [
      {
        id: "item-ID-1234",
        title: "Mi producto",
        currency_id: "PEN",
        picture_url: "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif",
        description: "Descripción del Item",
        category_id: "art",
        quantity: 1,
        unit_price: 75.76,
      },
    ],
    payer: {
      name: "Juan",
      surname: "Lopez",
      email: "user@email.com",
      phone: {
        area_code: "11",
        number: "4444-4444",
      },
      identification: {
        type: "DNI",
        number: "12345678",
      },
      address: {
        street_name: "Street",
        street_number: 123,
        zip_code: "5700",
      },
    },
    back_urls: {
      success: "https://www.success.com",
      failure: "https://www.failure.com",
      pending: "https://www.pending.com",
    },
    auto_return: "approved",
  };

  const preference = new Preference(client);

  const response = await preference.create({
    body: preferenceBody,
  });

  console.log(response)

  return NextResponse.json(response);
}
