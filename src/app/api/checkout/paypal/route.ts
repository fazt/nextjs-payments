import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import prisma from "@/libs/prisma";

const clientId = process.env.PAYPAL_CLIENT_ID as string;
const secret = process.env.PAYPAL_CLIENT_SECRET as string;

// cual es la aplicacio
const environment = new paypal.core.SandboxEnvironment(clientId, secret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: Request) {
  const request = new paypal.orders.OrdersCreateRequest();
  const cart = await req.json();

  const productsIds = cart.map((product: any) => product.id);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productsIds,
      },
    },
  });

  const productsWithQuantity = products.map((product) => {
    const productInCart = cart.find((p: any) => p.id === product.id);

    return {
      ...product,
      quantity: productInCart.quantity,
    };
  });

  const total = productsWithQuantity.reduce((acc, product) => {
    return acc + product.price * product.quantity;
  }, 0);

  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total.toString(),
        },
      },
    ],
  });

  const response = await client.execute(request);

  return NextResponse.json({
    id: response.result.id,
    status: response.result.status,
  });
}
