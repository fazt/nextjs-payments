import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const cart = await request.json();
    const session = await getServerSession(authOptions);

    const productsIds = cart.map((product: any) => product.id);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productsIds,
        },
      },
    });

    const productsWithQuantity = products.map((product) => {
      const productInCart = cart.find((p: any) => p.id === product.id);

      return {
        ...product,
        quantity: productInCart.quantity,
      };
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    const productString = JSON.stringify(
      productsWithQuantity.map((product) => ({
        id: product.id,
        quantity: product.quantity,
      }))
    );

    const result = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
        userId: session.user.id,
        products: productString,
      },
      line_items: [
        ...products.map((product) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: productsWithQuantity.find((p) => p.id === product.id)
            ?.quantity,
        })),
      ],
      success_url: "http://localhost:2999/success",
      cancel_url: "http://localhost:2999/cart",
      // pago por suscripción
      mode: "payment",
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
