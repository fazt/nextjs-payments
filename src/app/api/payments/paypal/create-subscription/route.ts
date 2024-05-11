import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextResponse } from "next/server";

// I-9MKAASGKPU0D
export async function POST() {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const formattedString = startTime.toISOString();

    const response = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions`,
      {
        plan_id: "P-2DB79082J3820331UMY7XN3I",
        start_time: formattedString,
        subscriber: {
          name: {
            given_name: "John",
            surname: "Doe",
          },
          email_address: "john@gmail.com",
        },
        application_context: {
          brand_name: "example",
          locale: "en-US",
          shipping_preference: "SET_PROVIDED_ADDRESS",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: "http://localhost:3000/api/payments/paypal/success",
          cancel_url: "http://localhost:3000/subscriptions",
        },
      },
      {
        headers,
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error.response.data);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
