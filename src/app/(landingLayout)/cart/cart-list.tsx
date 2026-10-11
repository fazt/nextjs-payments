"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { cartCount, useCartStore, useHydrated } from "@/store/cartStore";
import type { GatewayStatus } from "@/libs/config";
import { PaypalButton } from "./paypal-button";
import { MercadoPagoButton } from "./mercadopago-button";

interface Props {
  gateways: GatewayStatus;
  paypal: { clientId: string; environment: "sandbox" | "production" } | null;
  mercadoPagoPublicKey: string | null;
}

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });

export function CartList({ gateways, paypal, mercadoPagoPublicKey }: Props) {
  const hydrated = useHydrated();
  const { cart, removeFromCart, increase, decrease, clearCart } = useCartStore();
  const { status } = useSession();
  const router = useRouter();
  const [loadingStripe, setLoadingStripe] = useState(false);

  if (!hydrated) {
    return <p className="text-gray-500">Cargando carrito…</p>;
  }

  if (cart.length === 0) {
    return (
      <Card>
        <p className="text-gray-700">Tu carrito está vacío.</p>
        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          Ver productos →
        </Link>
      </Card>
    );
  }

  const total = cart.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0) / 100;
  // El servidor recalcula precios y stock: solo se envían ids y cantidades.
  const checkoutItems = cart.map(({ id, quantity }) => ({ id, quantity }));

  async function payWithStripe() {
    setLoadingStripe(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutItems),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al pagar con Stripe");
      setLoadingStripe(false);
    }
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-md object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-md bg-gray-200" />
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-600">{money.format(item.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                aria-label={`Quitar una unidad de ${item.name}`}
                onClick={() => decrease(item.id)}
                disabled={item.quantity <= 1}
              >
                −
              </Button>
              <span className="w-6 text-center text-gray-900">{item.quantity}</span>
              <Button aria-label={`Añadir una unidad de ${item.name}`} onClick={() => increase(item.id)}>
                +
              </Button>
              <Button className="bg-red-500 hover:bg-red-600" onClick={() => removeFromCart(item)}>
                Quitar
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">{cartCount(cart)} productos</span>
          <span className="text-xl font-bold text-gray-900">Total: {money.format(total)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Stripe y PayPal cobran en USD; Mercado Pago en la moneda configurada en el servidor.
        </p>

        {status === "loading" ? (
          <p className="mt-6 text-sm text-gray-500">Cargando sesión…</p>
        ) : status !== "authenticated" ? (
          <div className="mt-6">
            <Button href="/auth/login?callbackUrl=/cart">Inicia sesión para pagar</Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button onClick={payWithStripe} disabled={!gateways.stripe || loadingStripe}>
              {gateways.stripe
                ? loadingStripe
                  ? "Redirigiendo…"
                  : "Pagar con Stripe"
                : "Stripe (no disponible)"}
            </Button>

            {paypal ? (
              <PaypalButton
                clientId={paypal.clientId}
                environment={paypal.environment}
                items={checkoutItems}
                onPaid={() => {
                  clearCart();
                  router.push("/paypal/success");
                }}
              />
            ) : (
              <Button disabled>PayPal (no disponible)</Button>
            )}

            <MercadoPagoButton
              enabled={gateways.mercadopago}
              publicKey={mercadoPagoPublicKey}
              items={checkoutItems}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
