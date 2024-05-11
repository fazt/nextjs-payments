import { getAccessToken } from "@/libs/paypal";
import axios from "axios";
import { NextResponse } from "next/server";

// P-2DB79082J3820331UMY7XN3I
export async function POST() {
  try {
    const token = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const body = {
      name: "Premium Plan",
      description: "Premium Plan",
      price: "10",
    };

    const planBody = {
      product_id: "PROD-7AE201030Y533193E",
      name: body.name,
      description: body.description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "TRIAL",
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: "0",
              currency_code: "USD",
            },
          },
        },
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 12,
          pricing_scheme: {
            fixed_price: {
              value: body.price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "10",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "10",
        inclusive: false,
      },
    };

    const response = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/billing/plans`,
      planBody,
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
