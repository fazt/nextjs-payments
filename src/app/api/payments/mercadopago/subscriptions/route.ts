import { client } from "@/libs/mercadopago";
import { PreApprovalPlan } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const plan = await new PreApprovalPlan(client).create({
    body: {
      reason: "Suscripcion mensual de gimnasio",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        repetitions: 12,
        billing_day: 10,
        billing_day_proportional: true,
        free_trial: {
          frequency: 1,
          frequency_type: "months",
        },
        transaction_amount: 45,
        currency_id: "PEN",
      },
      payment_methods_allowed: {
        payment_types: [{}],
        payment_methods: [{}],
      },
      back_url: "https://www.yoursite.com",
    },
  });

  return NextResponse.json(plan);
}
