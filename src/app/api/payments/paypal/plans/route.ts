// v1/billing/plans?page_size=10&page=1&total_required=true

import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = await getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.get(
    `${process.env.PAYPAL_API_URL}/v1/billing/plans?page_size=10&page=1&total_required=true`,
    {
      headers,
    }
  );

  return NextResponse.json(response.data);
}
