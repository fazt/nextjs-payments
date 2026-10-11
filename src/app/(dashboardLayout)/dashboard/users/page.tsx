import { redirect } from "next/navigation";
import prisma from "@/libs/prisma";
import { getSession } from "@/libs/session";
import UserTable from "@/components/users/UserTable";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });

export default async function DashboardUsersPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  // Nunca se envía la contraseña (ni su hash) al cliente
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      last_name: true,
      email: true,
      role: true,
      status: true,
      subscriptionProvider: true,
      created_at: true,
      plan: { select: { name: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-100">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-100">Lista de usuarios registrados</p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black/5 sm:rounded-lg">
              <UserTable
                users={users.map((user) => ({
                  id: user.id,
                  name: `${user.name} ${user.last_name}`,
                  email: user.email,
                  role: user.role ?? "user",
                  subscription:
                    user.status === "ACTIVE" && user.subscriptionProvider
                      ? `${user.plan?.name ?? "Plan"} (${user.subscriptionProvider})`
                      : "—",
                  orders: user._count.orders,
                  created_at: date.format(user.created_at),
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
