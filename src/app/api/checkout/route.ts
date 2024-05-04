import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  const data = await request.json();
  const productsIds = data.map((product: any) => product.id);
  const session = await getServerSession(authOptions);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productsIds,
      },
    },
  });

  const result = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    metadata: {
      userId: session?.user.id,
      productsIds: productsIds.join(","), // "1,2,3"
    },
    line_items: [
      ...products.map((product) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            // images: [product.image],
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      })),
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cart",
    // pago por suscripción
    mode: "payment",
  });

  console.log(result);

  return NextResponse.json({ url: result.url });
}
