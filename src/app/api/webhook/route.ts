import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/libs/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

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
        const userId = checkoutSessionCompleted.metadata.userId as string;
        const productsIds = checkoutSessionCompleted.metadata.productsIds
          .split(",")
          .map((id) => parseInt(id));

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

        const products = await prisma.product.findMany({
          where: {
            id: {
              in: productsIds,
            },
          },
        });

        const total = products.reduce((acc, product) => acc + product.price, 0);

        const newOrder = await prisma.order.create({
          data: {
            userId: parseInt(userId as string),
            total,
          },
        });

        await prisma.orderDetails.createMany({
          data: products.map((product) => ({
            orderId: newOrder.id,
            productId: product.id,
            price: product.price,
            quantity: 1,
          })),
        });

        // const newOrder = await prisma.order.create({
        //   data:
        // })
      }

      if (checkoutSessionCompleted.mode === "subscription") {
        await prisma.user.update({
          where: {
            id: parseInt(checkoutSessionCompleted.metadata!.userId as string),
          },
          data: {
            subscriptionId: checkoutSessionCompleted.subscription as string,
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
