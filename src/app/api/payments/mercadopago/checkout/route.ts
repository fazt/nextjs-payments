import { Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { client } from "@/libs/mercadopago";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const cart = await request.json();
    const preference = new Preference(client); // orden de compra

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    console.log(cart);
    const items = cart.map((product: any) => ({
      id: product.id,
      title: product.name,
      quantity: product.quantity,
      unit_price: product.price,
      currency_id: "PEN",
    }));

    console.log(items);

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${process.env.MERCADOPAGO_BACKEND_URL}/mercadopago/success`,
          failure: `${process.env.MERCADOPAGO_BACKEND_URL}/mercadopago/failure`,
          pending: `${process.env.MERCADOPAGO_BACKEND_URL}/mercadopago/pending`,
        },
        auto_return: "approved",
        metadata: {
          userId: session.user.id,
        },
      },
    });

    console.log(response);

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
