import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// cancel subscription
export async function POST(request: Request) {
  // session

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(null, {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user?.subscriptionId) {
      return new Response(null, {
        status: 400,
      });
    }

    await stripe.subscriptions.cancel(
      user.subscriptionId as string
    );

    const userUpdated = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        subscriptionId: null,
      },
    });

    return NextResponse.json(userUpdated);
  } catch (error) {
    console.error(error);
    return new Response(null, {
      status: 500,
    });
  }
}
