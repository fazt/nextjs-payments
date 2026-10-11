"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { navbarRoutes } from "@/routes/navbarRoutes";
import Link from "next/link";
import { Badge, Logo } from "@/components/ui";
import { useSession } from "next-auth/react";
import { cartCount, useCartStore, useHydrated } from "@/store/cartStore";

const footerNavigation = [
  {
    title: "Tienda",
    links: [
      { name: "Productos", href: "/products" },
      { name: "Suscripciones", href: "/subscriptions" },
      { name: "Carrito", href: "/cart" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { name: "Iniciar sesión", href: "/auth/login" },
      { name: "Crear cuenta", href: "/auth/register" },
      { name: "Mi panel", href: "/dashboard" },
    ],
  },
  {
    title: "Proyecto",
    links: [
      { name: "Código en GitHub", href: "https://github.com/fazt/nextjs-payments" },
      { name: "Documentación de Stripe", href: "https://docs.stripe.com" },
      { name: "PayPal Developer", href: "https://developer.paypal.com" },
      { name: "Mercado Pago Developers", href: "https://www.mercadopago.com.pe/developers" },
    ],
  },
];

interface Props {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const hydrated = useHydrated();
  const { status } = useSession();
  const account =
    status === "authenticated"
      ? { href: "/dashboard", text: "Mi panel" }
      : { href: "/auth/login", text: "Iniciar sesión" };
  const routes = navbarRoutes.filter(
    (route) => status !== "authenticated" || !route.href.startsWith("/auth")
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5" aria-label="Next Payments, inicio">
              <Logo withText />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Abrir menú</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:items-center lg:gap-x-12">
            {routes.map((item) => (
              <Link
                key={item.text}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.text}
              </Link>
            ))}

            <Link href="/cart" className="text-sm font-semibold leading-6 text-gray-900">
              Carrito <Badge>{hydrated ? cartCount(cart) : 0}</Badge>
            </Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href={account.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {account.text} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5" aria-label="Next Payments, inicio">
                <Logo withText />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Cerrar menú</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {routes.map((item) => (
                    <Link
                      key={item.text}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Carrito ({hydrated ? cartCount(cart) : 0})
                  </Link>
                  <Link
                    href={account.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {account.text}
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {children}

      {/* Footer */}
      <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <footer
          aria-labelledby="footer-heading"
          className="relative border-t border-gray-900/10 py-16 sm:mt-40 sm:py-24"
        >
          <h2 id="footer-heading" className="sr-only">
            Pie de página
          </h2>
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-4">
              <Logo withText />
              <p className="max-w-xs text-sm leading-6 text-gray-600">
                Proyecto de ejemplo para aprender a integrar pagos en Next.js. Usa siempre credenciales de prueba.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2 xl:mt-0">
              {footerNavigation.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.links.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                          {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
