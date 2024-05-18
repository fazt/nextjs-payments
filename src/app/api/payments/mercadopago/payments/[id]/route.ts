import { client } from "@/libs/mercadopago";
import { Payment } from "mercadopago";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const payment = await new Payment(client).get({
    id: "1318233274",
  });
  console.log(payment)

  return NextResponse.json(payment);
}
