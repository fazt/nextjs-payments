import { NextResponse } from "next/server";
import axios from "axios";
import { getAccessToken } from "@/libs/paypal";

const PAYPAL_API_URL = "https://api.sandbox.paypal.com";

// "PROD-7AE201030Y533193E"
export async function POST() {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/catalogs/products`,
      {
        name: "Video Streaming Service",
        type: "SERVICE",
        category: "SOFTWARE",
        image_url: "https://example.com/streaming.jpg",
        home_url: "https://example.com/home",
      },
      {
        headers,
      }
    );

    console.log(response);

    return NextResponse.json(response.data);
  } catch (error) {
    console.log(error);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
