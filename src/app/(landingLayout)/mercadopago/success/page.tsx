import { client } from "@/libs/mercadopago";
import { Payment } from "mercadopago";
import {redirect} from 'next/navigation'

interface Props {
  params: any;
  searchParams: any;
}

async function checkPayment(paymentId: string) {
  try {
    const payment = await new Payment(client).get({ id: paymentId });

    if (payment.status !== "approved") {
      return <div>Hubo un error en la transacción</div>;
    }

    console.log(payment);
  } catch (error) {
    console.error(error);

    // redirect('/cart')
  }
}

async function MercadoPagoSuccess({ params, searchParams }: Props) {
  const paymentId = searchParams.payment_id;

  if (!searchParams.payment_id) {
    return <div>Hubo un error en la transacción</div>;
  }

  await checkPayment(paymentId);

  return <div>Gracias por tu compra</div>;
}

export default MercadoPagoSuccess;
