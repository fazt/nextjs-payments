import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

export async function GET(request: NextRequest) {
  const subscriptionId = request.nextUrl.searchParams.get("subscription_id");
  //   const ba_token = request.nextUrl.searchParams.get("ba_token");
  //   const token = request.nextUrl.searchParams.get("token");

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json("Unauthorized", {
      status: 401,
    });
  }

  //   si el usuario ya tiene un subscription id, no hacemos nada
  //   if (session.user.subscriptionId) {
  //     return NextResponse.json("Subscription already exists", {
  //       status: 400,
  //     });
  //   }

  const accessToken = await getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await axios.get(
    `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers,
    }
  );

  if (response.data.status === "ACTIVE") {
    // registramos el subscrioptio id en una table

    // relacionamos el usuario con el subscription id
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        subscriptionId: response.data.id, // 1
        status: response.data.status,
        subscriptionProvider: "paypal",
        startedAt: response.data.start_time,
      },
    });
    console.log(updatedUser);
  }

  console.log(response.data);

  return NextResponse.json(response.data);
}
