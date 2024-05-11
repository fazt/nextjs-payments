import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.get(
    `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions/I-SP09DFFT59GC`,
    {
      headers,
    }
  );

  console.log(response.data);

  return NextResponse.json(response.data);
}
