import { redirect } from "next/navigation";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const isAdmin = session.user.role === "admin";
  const orderFilter = isAdmin ? {} : { userId: session.user.id };

  const [stats, orders] = await Promise.all([
    isAdmin
      ? Promise.all([
          prisma.product.count(),
          prisma.user.count(),
          prisma.order.count(),
          prisma.payments.aggregate({ _sum: { total: true } }),
          prisma.user.count({ where: { status: "ACTIVE", subscriptionId: { not: null } } }),
        ])
      : null,
    prisma.order.findMany({
      where: orderFilter,
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        user: { select: { email: true } },
        payments: { select: { provider: true } },
        orderDetails: { include: { product: { select: { name: true } } } },
      },
    }),
  ]);

  const cards = stats
    ? [
        { label: "Productos", value: stats[0] },
        { label: "Usuarios", value: stats[1] },
        { label: "Pedidos", value: stats[2] },
        { label: "Cobrado (todas las pasarelas)", value: money.format(stats[3]._sum.total ?? 0) },
        { label: "Suscripciones activas", value: stats[4] },
      ]
    : [];

  return (
    <div className="px-4 text-gray-100 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold">Hola, {session.user.name}</h1>

      {cards.length > 0 && (
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
              <dt className="text-sm text-gray-400">{card.label}</dt>
              <dd className="mt-1 text-2xl font-semibold">{card.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <h2 className="mt-10 text-lg font-semibold">
        {isAdmin ? "Últimos pedidos" : "Mis pedidos"}
      </h2>
      {orders.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">Todavía no hay pedidos.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10 rounded-lg bg-white/5 ring-1 ring-white/10">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-medium">
                  Pedido #{order.id} · {money.format(order.total)}
                  <span className="ml-2 text-xs uppercase text-indigo-300">
                    {order.payments[0]?.provider ?? ""}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  {order.orderDetails
                    .map((detail) => `${detail.quantity}× ${detail.product.name}`)
                    .join(", ")}
                </p>
              </div>
              <div className="text-sm text-gray-400 sm:text-right">
                {isAdmin && <p>{order.user.email}</p>}
                <p>{date.format(order.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
