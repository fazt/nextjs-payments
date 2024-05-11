import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const subscriptionId = "I-6281YXCX3CSA";
    const startTime = "2024-01-01T00:00:00.000Z";
    const endTime = "2024-11-01T00:00:00.000Z";

    const response = await axios.get(
      `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/transactions?start_time=${startTime}&end_time=${endTime}`,
      {
        headers,
      }
    );

    console.log(response);

    return NextResponse.json(response.data);
  } catch (error) {
    console.log(error.response);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
