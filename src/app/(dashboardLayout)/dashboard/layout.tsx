"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { dashboardRoutes } from "@/routes/navbarRoutes";
import { classNames } from "@/libs/classNames";
import { Button, Logo } from "@/components/ui";

interface Props {
  children: React.ReactNode;
}

function Navigation({ role, pathname }: { role: string; pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {dashboardRoutes
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <li key={item.text}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.text}
                  </Link>
                </li>
              ))}
            <li className="pt-4">
              <Button onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</Button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default function DashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8 text-gray-300">Cargando…</div>;
  }

  const role = session?.user.role ?? "user";

  return (
    <div>
      {/* Sidebar móvil */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 xl:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Cerrar menú</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
              <div className="flex h-16 shrink-0 items-center">
                <Link href="/" aria-label="Next Payments">
                <Logo withText textClassName="text-white" />
              </Link>
              </div>
              <Navigation role={role} pathname={pathname} />
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Sidebar de escritorio */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" aria-label="Next Payments">
                <Logo withText textClassName="text-white" />
              </Link>
          </div>
          <Navigation role={role} pathname={pathname} />
          <div className="-mx-6 mt-auto px-6 py-3 text-sm font-semibold leading-6 text-white">
            {session?.user.name} {session?.user.lastname}
            <span className="block text-xs font-normal text-gray-400">{session?.user.email}</span>
          </div>
        </div>
      </div>

      <div className="xl:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-xs sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/" className="text-sm font-semibold text-gray-300 hover:text-white">
            ← Volver a la tienda
          </Link>
        </div>

        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
