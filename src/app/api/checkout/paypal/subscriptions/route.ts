import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import prisma from "@/libs/prisma";

const clientId = process.env.PAYPAL_CLIENT_ID as string;
const secret = process.env.PAYPAL_CLIENT_SECRET as string;

const environment = new paypal.core.SandboxEnvironment(clientId, secret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: Request) {
    // subcription for monthly payment
    const request = new paypal.orders.OrdersCreateRequest();

    // request.requestBody({
    //     intent: "SUBSCRIPTION",
    //     purchase_units: [
    //         {
    //             amount: {
    //                 currency_code: "USD",
    //                 value: "10.00",
    //             },
    //         },
    //     ],
    // });

    const response = await client.execute(request);
}
