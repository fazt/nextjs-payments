import axios from "axios";
import { NextResponse } from "next/server";

export async function getAccessToken() {
  const url = `${process.env.PAYPAL_API_URL}/v1/oauth2/token`;

  try {
    const response = await axios.post(url, "grant_type=client_credentials", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    console.error(error);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
