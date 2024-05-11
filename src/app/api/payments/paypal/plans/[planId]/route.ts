import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextResponse } from "next/server";

interface Params {
  params: {
    planId: string;
  };
}

export async function GET(request: Request, { params: { planId } }: Params) {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log(planId);

    const response = await axios.get(
      `${process.env.PAYPAL_API_URL}/v1/billing/plans/${planId}`,
      {
        headers,
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.log(error.response.data);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
