import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/libs/prisma";

// https://2kwmbfhd-3000.brs.devtunnels.ms/
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET as string;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { "Webhook Error": "No signature" },
      {
        status: 400,
      }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json(
      { "Webhook Error": err.message },
      {
        status: 400,
      }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      if (checkoutSessionCompleted.mode === "payment") {
        const userId = checkoutSessionCompleted.metadata!.userId as string;
        const products = JSON.parse(
          checkoutSessionCompleted.metadata!.products as string
        );

        const userFound = await prisma.user.findUnique({
          where: {
            id: parseInt(userId as string),
          },
          select: {
            email: true,
          },
        });

        if (!userFound) {
          return NextResponse.json(
            { "Webhook Error": "User not found" },
            {
              status: 400,
            }
          );
        }

        const productsDB = await prisma.product.findMany({
          where: {
            id: {
              in: products.map((product: any) => product.id),
            },
          },
        });

        const total = productsDB.reduce((acc, product) => {
          const productInCart = products.find((p: any) => p.id === product.id);

          return acc + product.price * productInCart.quantity;
        }, 0);

        const newOrder = await prisma.order.create({
          data: {
            userId: parseInt(userId as string),
            total,
          },
        });

        await prisma.orderDetails.createMany({
          data: productsDB.map((product) => ({
            orderId: newOrder.id,
            productId: product.id,
            price: product.price,
            quantity: products.find((p: any) => p.id === product.id)?.quantity,
          })),
        });

        // reducir stock
        for (const product of products) {
          await prisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              stock: {
                decrement: product.quantity,
              },
            },
          });
        }
      }

      if (checkoutSessionCompleted.mode === "subscription") {
        await prisma.user.update({
          where: {
            id: parseInt(checkoutSessionCompleted.metadata!.userId as string),
          },
          data: {
            subscriptionId: checkoutSessionCompleted.subscription as string,
            subscriptionProvider: "stripe",
          },
        });
      }

      break;
      // ... handle other event types
      // case subscription canceled
      // case "customer.subscription.deleted":
      //   const subscriptionDeleted = event.data.object;

      //   await prisma.user.update({
      //     where: {
      //       subscriptionId: subscriptionDeleted.id,
      //       endDatePlan: "2024-06-06",
      //       cancelado: true
      //     },
      //     data: {
      //       subscriptionId: null,
      //     },
      //   });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
