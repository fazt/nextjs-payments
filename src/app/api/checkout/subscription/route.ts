import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  // obtener id del usuario
  const session = await getServerSession(authOptions);
  const body = await request.json();

  if (!session) {
    return NextResponse.json(
      { error: "You need to be authenticated to do this" },
      {
        status: 401,
      }
    );
  }

  // generar orden de compra o pago
  const result = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: body.priceId,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/products",
    // pago por suscripción
    mode: "subscription",
    metadata: {
      hello: "world",
      test: 123,
      userId: session.user.id,
    },
  });

  console.log(result);

  return NextResponse.json({ url: result.url });
}
