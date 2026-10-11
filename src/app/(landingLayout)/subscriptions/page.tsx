import type { Metadata } from "next";
import { CheckIcon } from "@heroicons/react/20/solid";
import prisma from "@/libs/prisma";
import { classNames } from "@/libs/classNames";
import { getGatewayStatus } from "@/libs/config";
import { getPaypalClientId, getPaypalEnvironment } from "@/libs/paypal";
import { SubscribeButtons } from "./subscribe-buttons";

export const metadata: Metadata = {
  title: "Suscripciones | Next Payments",
};

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });

export default async function SubscriptionsPage() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
  const gateways = getGatewayStatus();
  const paypalClientId = getPaypalClientId();
  const paypal =
    gateways.paypal && paypalClientId
      ? { clientId: paypalClientId, environment: getPaypalEnvironment() }
      : null;
  // El plan del medio se destaca como "más popular"
  const popularIndex = Math.floor((plans.length - 1) / 2);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Suscripciones</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Planes mensuales para cada etapa
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Suscríbete con tarjeta (Stripe) o con PayPal. Puedes cancelar cuando quieras desde tu
          perfil.
        </p>

        {plans.length === 0 && (
          <p className="mt-16 text-center text-gray-500">
            No hay planes todavía. Ejecuta <code>npm run db:seed</code> para crear los de ejemplo.
          </p>
        )}

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {plans.map((plan, index) => {
            const mostPopular = index === popularIndex;
            return (
              <div
                key={plan.id}
                className={classNames(
                  mostPopular ? "ring-2 ring-indigo-600" : "ring-1 ring-gray-200",
                  "flex flex-col rounded-3xl p-8"
                )}
              >
                <h3
                  id={`plan-${plan.id}`}
                  className={classNames(
                    mostPopular ? "text-indigo-600" : "text-gray-900",
                    "text-lg font-semibold leading-8"
                  )}
                >
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {money.format(plan.price)}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/mes</span>
                </p>

                <SubscribeButtons
                  planId={plan.id}
                  stripeEnabled={gateways.stripe}
                  paypal={plan.paypalPlanId ? paypal : null}
                  paypalReason={
                    !paypal ? "PayPal (no disponible)" : "PayPal (plan sin sincronizar)"
                  }
                />

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
