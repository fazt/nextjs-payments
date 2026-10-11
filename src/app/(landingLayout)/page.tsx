import Link from "next/link";
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

const gateways = [
  {
    name: "Stripe",
    description: "Checkout de pago único y suscripciones con tarjeta, con webhooks firmados.",
    flows: ["Pago único", "Suscripciones", "Cancelación desde el perfil"],
  },
  {
    name: "PayPal",
    description: "Órdenes capturadas en el servidor y planes de suscripción con el SDK oficial.",
    flows: ["Pago único", "Suscripciones", "Webhooks verificados"],
  },
  {
    name: "Mercado Pago",
    description: "Preferencias de Checkout Pro o Wallet Brick, con validación de firma del webhook.",
    flows: ["Pago único", "Checkout Pro", "Wallet Brick"],
  },
];

const features = [
  {
    name: "Precios calculados en el servidor",
    description:
      "El navegador solo envía qué productos y cuántos. El total se recalcula con los precios de la base de datos antes de crear cada cobro.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Webhooks idempotentes",
    description:
      "Cada pasarela registra el pedido, su detalle y el pago, y descuenta stock en una transacción. Si el webhook llega dos veces, no se duplica.",
    icon: ArrowPathIcon,
  },
  {
    name: "Suscripciones desde la base de datos",
    description:
      "Los planes se guardan en PostgreSQL. Stripe crea el precio al vuelo en Checkout y PayPal se sincroniza desde el panel, sin ids escritos en el código.",
    icon: CreditCardIcon,
  },
  {
    name: "Panel de administración",
    description:
      "Resumen de ventas, pedidos, productos con imágenes en Cloudinary, categorías, planes y usuarios con roles.",
    icon: ChartBarIcon,
  },
  {
    name: "Funciona sin todas las claves",
    description:
      "Si falta la configuración de una pasarela, la tienda sigue funcionando y esa opción aparece como no disponible.",
    icon: BanknotesIcon,
  },
  {
    name: "Pensado para Latinoamérica",
    description:
      "Mercado Pago junto a Stripe y PayPal para cubrir tarjetas locales, internacionales y billeteras.",
    icon: GlobeAmericasIcon,
  },
];

const faqs = [
  {
    question: "¿Necesito cuentas reales para probarlo?",
    answer:
      "No. Usa las credenciales de prueba de cada pasarela (Stripe en modo test, PayPal Sandbox y las cuentas de prueba de Mercado Pago). El README explica dónde obtenerlas.",
  },
  {
    question: "¿Cómo pruebo los webhooks en local?",
    answer:
      "Con Stripe CLI (stripe listen) para Stripe y con un túnel público (ngrok, Cloudflare Tunnel) para PayPal y Mercado Pago. Las rutas están en src/app/api.",
  },
  {
    question: "¿Puedo usar solo una pasarela?",
    answer:
      "Sí. Configura las variables de la pasarela que quieras y deja vacías las demás: sus botones se ocultan y sus endpoints responden 503.",
  },
  {
    question: "¿Qué stack usa?",
    answer:
      "Next.js 16 con App Router, React 19, Prisma 7 con PostgreSQL, NextAuth para la autenticación y Tailwind CSS 4.",
  },
];

function Blob({ className }: { className: string }) {
  return (
    <div className={`absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl ${className}`} aria-hidden="true">
      <div
        className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
        }}
      />
    </div>
  );
}

function page() {
  return (
    <main className="isolate">
      {/* Hero */}
      <div className="relative pt-14">
        <Blob className="-top-40 sm:-top-80" />
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mx-auto mb-6 w-fit rounded-full px-4 py-1.5 text-sm leading-6 text-gray-600 ring-1 ring-inset ring-gray-900/10">
                Tienda de ejemplo con Next.js 16 y Prisma 7
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-900 sm:text-6xl">
                Cobra con Stripe, PayPal y Mercado Pago en una sola app
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Carrito, pagos únicos, suscripciones mensuales y webhooks que registran cada pedido. Todo con
                código abierto que puedes leer, copiar y adaptar a tu proyecto.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <Link
                  href="/products"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Ver productos
                </Link>
                <Link href="/subscriptions" className="text-sm font-semibold leading-6 text-gray-900">
                  Ver planes de suscripción <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pasarelas */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
          {gateways.map((gateway) => (
            <div key={gateway.name} className="rounded-2xl bg-white/80 p-8 ring-1 ring-gray-900/10 backdrop-blur">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">{gateway.name}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">{gateway.description}</p>
              <ul role="list" className="mt-6 flex flex-wrap gap-2">
                {gateway.flows.map((flow) => (
                  <li
                    key={flow}
                    className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20"
                  >
                    {flow}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Características */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-48 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Más que botones de pago</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Lo que suele faltar en los tutoriales
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Un cobro no termina cuando el cliente paga: hay que confirmar el pago en el servidor, guardar el pedido y
            evitar que alguien cambie el precio desde el navegador.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <div className="mx-auto mt-32 max-w-2xl divide-y divide-gray-900/10 px-6 sm:mt-48 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Preguntas frecuentes</h2>
        <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
          {faqs.map((faq) => (
            <div key={faq.question} className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
              <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">{faq.question}</dt>
              <dd className="mt-4 lg:col-span-7 lg:mt-0">
                <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Llamada final */}
      <div className="relative mt-32 px-6 sm:mt-48 lg:px-8">
        <Blob className="top-1/2 -translate-y-1/2" />
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Prueba el flujo completo en modo test
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Crea una cuenta, añade productos al carrito y paga con las tarjetas de prueba de cada pasarela.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link
              href="/auth/register"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Crear una cuenta
            </Link>
            <a
              href="https://github.com/fazt/nextjs-payments"
              className="text-sm font-semibold leading-6 text-gray-900"
              target="_blank"
              rel="noreferrer"
            >
              Ver el código en GitHub <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
export default page;
