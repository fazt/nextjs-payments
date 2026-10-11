import { redirect } from "next/navigation";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";
import { getStripe } from "@/libs/stripe";
import { Button } from "@/components/ui";
import { ButtonUnsubscribe } from "./ButtonUnsubscribe";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("es-PE", { dateStyle: "long" });

/** Próxima renovación de una suscripción de Stripe (desde la API 2025-03-31 vive en los items). */
async function getStripeRenewal(subscriptionId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];
    return {
      amount: (item?.price.unit_amount ?? 0) / 100,
      renewsAt: item ? new Date(item.current_period_end * 1000) : null,
    };
  } catch {
    return null;
  }
}

async function PageProfile() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { plan: true },
  });
  if (!user) redirect("/auth/login");

  const hasSubscription = Boolean(user.subscriptionId);
  const stripeInfo =
    hasSubscription && user.subscriptionProvider === "stripe"
      ? await getStripeRenewal(user.subscriptionId!)
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-white">
      <h1 className="text-2xl font-bold">
        {user.name} {user.last_name}
      </h1>
      <h2 className="text-lg text-gray-300">{user.email}</h2>

      <div className="mt-8 rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="text-lg font-semibold">Suscripción</h3>
        {hasSubscription ? (
          <div className="mt-3 space-y-1 text-gray-200">
            <p>
              Plan: <strong>{user.plan?.name ?? "—"}</strong> ·{" "}
              {money.format(stripeInfo?.amount ?? user.plan?.price ?? 0)}/mes
            </p>
            <p>
              Pasarela: <span className="capitalize">{user.subscriptionProvider}</span> · Estado:{" "}
              {user.status}
            </p>
            {user.startedAt && <p>Desde: {date.format(user.startedAt)}</p>}
            {stripeInfo?.renewsAt && <p>Próxima renovación: {date.format(stripeInfo.renewsAt)}</p>}
            <div className="pt-4">
              <ButtonUnsubscribe />
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-4 text-gray-300">
            <p>
              {user.status === "CANCELLED"
                ? "Cancelaste tu suscripción."
                : "Todavía no tienes una suscripción."}
            </p>
            <Button href="/subscriptions" className="inline-block">
              Ver planes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageProfile;
