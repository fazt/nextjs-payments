import { getAccessToken } from "@/libs/paypal";
import axios, { AxiosError } from "axios";
import { NextResponse } from "next/server";

// api/payments/paypal/cancel-subscription/:subscriptionId
export async function POST(
  request: Request,
  {
    params: { subscriptionId },
  }: {
    params: {
      subscriptionId: string;
    };
  }
) {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log(subscriptionId)

    const res = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
      },
      {
        headers,
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }

    return NextResponse.json(error, {
      status: 500,
    });
  }
}
