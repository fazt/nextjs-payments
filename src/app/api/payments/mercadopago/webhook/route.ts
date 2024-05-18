import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { client } from "@/libs/mercadopago";
import { headers } from "next/headers";
import crypto from "crypto";
import prisma from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { use } from "react";

export async function POST(request: Request) {
  const body = await request.json();
  const ListHeaders = headers();
  const xRequestId = ListHeaders.get("x-request-id");
  const xSignature = ListHeaders.get("x-signature") as string;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("data.id");
  let [ts, signature] = xSignature.split(",");
  ts = ts.split("=")[1];
  signature = signature.split("=")[1];

  //   valida datos de forma segura
  const signatureTemplate = `id:${id};request-id:${xRequestId};ts:${ts};`;

  const cyphedSignature = crypto
    .createHmac("sha256", process.env.MERCADOPAGO_WEBHOOK_SECRET_KEY as string)
    .update(signatureTemplate)
    .digest("hex");

  if (cyphedSignature !== signature) {
    return NextResponse.json({ status: "Not Authorized" }, { status: 401 });
  }

  //   consulta datos de forma segura
  const paymentId = body.data.id;

  const payment = await new Payment(client).get({
    id: paymentId,
  });

  //   guardar el pago en la base de datos y actualizar el estado del pedido

  const userFound = await prisma.user.findUnique({
    where: {
      id: payment.metadata.user_id,
    },
  });

  if (!userFound) {
    return NextResponse.json({ status: "User not found" }, { status: 400 });
  }

  const newPaymentRecord = await prisma.payments.create({
    data: {
      total: payment.transaction_amount as number,
      userId: userFound.id,
      paymentId: payment.id as number,
      provider: "mercadopago",
    },
  });

  console.log(payment);
  console.log(body);
  console.log(newPaymentRecord);

  return NextResponse.json({ status: "ok" });
}
