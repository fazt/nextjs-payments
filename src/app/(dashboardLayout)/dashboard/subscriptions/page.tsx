import { redirect } from "next/navigation";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";
import { getGatewayStatus } from "@/libs/config";
import { SyncPaypalButton } from "./sync-paypal-button";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });

export default async function AdminPlansPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { users: { where: { status: "ACTIVE" } } } } },
  });
  const gateways = getGatewayStatus();
  const pending = plans.filter((plan) => !plan.paypalPlanId).length;

  return (
    <div className="px-4 text-gray-100 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold leading-6">Planes de suscripción</h1>
          <p className="mt-2 text-sm text-gray-300">
            Stripe crea el precio al vuelo en Checkout. PayPal necesita un plan de facturación:
            sincroniza los planes que aún no lo tienen.
          </p>
        </div>
        <SyncPaypalButton disabled={!gateways.paypal || pending === 0} pending={pending} />
      </div>

      <ul className="mt-8 divide-y divide-white/10 rounded-lg bg-white/5 ring-1 ring-white/10">
        {plans.map((plan) => (
          <li key={plan.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
            <div>
              <p className="font-medium">
                {plan.name} · {money.format(plan.price)}/mes
              </p>
              <p className="text-sm text-gray-400">{plan.description}</p>
            </div>
            <div className="text-sm text-gray-400 sm:text-right">
              <p>Suscriptores activos: {plan._count.users}</p>
              <p>Stripe: {plan.stripePriceId ?? "precio dinámico"}</p>
              <p>PayPal: {plan.paypalPlanId ?? "sin sincronizar"}</p>
            </div>
          </li>
        ))}
        {plans.length === 0 && (
          <li className="p-4 text-sm text-gray-400">No hay planes. Ejecuta npm run db:seed.</li>
        )}
      </ul>
    </div>
  );
}
