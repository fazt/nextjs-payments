import Link from "next/link";
import { getStripe } from "@/libs/stripe";
import { getSession } from "@/libs/session";
import UpdateSession from "./update-session";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

// Stripe redirige aquí con ?session_id={CHECKOUT_SESSION_ID}. El pedido o la
// suscripción se registran en el webhook; esta página solo informa del estado.
export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const session = await getSession();
  const stripe = getStripe();

  let title = "No encontramos el pago";
  let message = "Vuelve al carrito e inténtalo de nuevo.";
  let isSubscription = false;
  let paid = false;

  if (stripe && sessionId?.startsWith("cs_")) {
    try {
      const checkout = await stripe.checkout.sessions.retrieve(sessionId);
      const owner = checkout.metadata?.userId ?? checkout.client_reference_id;
      if (session && owner === String(session.user.id)) {
        isSubscription = checkout.mode === "subscription";
        paid = checkout.status === "complete";
        title = paid ? "¡Pago exitoso!" : "Pago pendiente";
        message = paid
          ? isSubscription
            ? "Tu suscripción está activa. Puedes gestionarla desde tu perfil."
            : "Gracias por tu compra. Verás el pedido en tu panel en unos segundos."
          : "Stripe aún está procesando el pago.";
      }
    } catch {
      // session_id inválido: se muestra el mensaje por defecto
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
      <p className="text-lg text-gray-600">{message}</p>
      <Link
        href={isSubscription ? "/dashboard/profile" : "/products"}
        className="mt-4 text-indigo-600 hover:underline"
      >
        {isSubscription ? "Ir a mi perfil →" : "Seguir comprando →"}
      </Link>
      {paid && <UpdateSession clearCart={!isSubscription} />}
    </div>
  );
}
