import { authOptions } from "@/libs/authOptions";
import prisma from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const event = await request.json();

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      console.log(event.resource);
    case "BILLING.SUBSCRIPTION.CANCELLED":
      console.log(event.resource.id);
      const userSubscribed = await prisma.user.findFirst({
        where: {
          subscriptionId: event.resource.id,
        },
      });

      if (!userSubscribed) {
        return NextResponse.json("User not found", {
          status: 404,
        });
      }

      await prisma.user.update({
        where: {
          id: userSubscribed.id,
        },
        data: {
          status: event.resource.status,
        },
      });

      console.log(event.start_time)
      if (new Date(event.start_time) > new Date()) {
        // cancelar la subscripcion
        console.log("ya no tienes tiempo para seguir usando el servicio");
      }

      console.log("tienes plazo para seguir usando el servicio");

    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
    default:
      break;
  }

  return NextResponse.json("ok");
}
