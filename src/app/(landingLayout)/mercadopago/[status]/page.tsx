import Link from "next/link";
import { notFound } from "next/navigation";
import { Payment } from "mercadopago";
import { getMercadoPago } from "@/libs/mercadopago";
import UpdateSession from "../../success/update-session";

export const dynamic = "force-dynamic";

const messages = {
  success: { title: "¡Gracias por tu compra!", text: "Mercado Pago aprobó el pago." },
  pending: { title: "Pago pendiente", text: "Te avisaremos cuando Mercado Pago lo confirme." },
  failure: { title: "El pago no se completó", text: "Puedes volver al carrito e intentarlo de nuevo." },
} as const;

interface Props {
  params: Promise<{ status: string }>;
  searchParams: Promise<{ payment_id?: string; status?: string }>;
}

// back_urls de Checkout Pro: /mercadopago/success | /pending | /failure.
// El pedido se registra en el webhook; aquí solo se consulta el estado.
export default async function MercadoPagoReturnPage({ params, searchParams }: Props) {
  const { status } = await params;
  if (!(status in messages)) notFound();

  const { payment_id: paymentId } = await searchParams;
  let result: { title: string; text: string } = messages[status as keyof typeof messages];

  const mercadopago = getMercadoPago();
  if (status === "success") {
    if (!paymentId || !mercadopago) {
      result = { title: "No encontramos el pago", text: "Vuelve al carrito e inténtalo de nuevo." };
    } else {
      try {
        const payment = await new Payment(mercadopago).get({ id: paymentId });
        if (payment.status !== "approved") result = messages.pending;
      } catch {
        result = { title: "No pudimos verificar el pago", text: "Revisa tu cuenta de Mercado Pago." };
      }
    }
  }

  const approved = result === messages.success;

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">{result.title}</h1>
      <p className="text-lg text-gray-600">{result.text}</p>
      <Link
        href={approved ? "/products" : "/cart"}
        className="mt-4 text-indigo-600 hover:underline"
      >
        {approved ? "Seguir comprando →" : "Volver al carrito →"}
      </Link>
      {approved && <UpdateSession clearCart />}
    </div>
  );
}
