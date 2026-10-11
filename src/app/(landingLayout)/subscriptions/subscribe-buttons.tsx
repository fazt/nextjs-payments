"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PayPalProvider, PayPalSubscriptionButton } from "@paypal/react-paypal-js/sdk-v6";
import { Button } from "@/components/ui";

interface Props {
  planId: number;
  stripeEnabled: boolean;
  paypal: { clientId: string; environment: "sandbox" | "production" } | null;
  paypalReason: string;
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data;
}

export function SubscribeButtons({ planId, stripeEnabled, paypal, paypalReason }: Props) {
  const { status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // id de la suscripción creada en el servidor, por si onApprove no lo trae
  const subscriptionIdRef = useRef<string | null>(null);

  if (status === "loading") {
    return (
      <Button className="mt-6 w-full" disabled>
        Cargando…
      </Button>
    );
  }

  if (status !== "authenticated") {
    return (
      <Button href="/auth/login?callbackUrl=/subscriptions" className="mt-6">
        Inicia sesión para suscribirte
      </Button>
    );
  }

  async function subscribeWithStripe() {
    setLoading(true);
    try {
      const data = await postJson("/api/checkout/subscription", { planId });
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error con Stripe");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <Button className="w-full" onClick={subscribeWithStripe} disabled={!stripeEnabled || loading}>
        {stripeEnabled ? (loading ? "Redirigiendo…" : "Suscribirme con Stripe") : "Stripe (no disponible)"}
      </Button>

      {paypal ? (
        <PayPalProvider
          clientId={paypal.clientId}
          environment={paypal.environment}
          components={["paypal-subscriptions"]}
          pageType="checkout"
        >
          <PayPalSubscriptionButton
            createSubscription={async () => {
              const data = await postJson("/api/checkout/paypal/subscriptions", { planId });
              subscriptionIdRef.current = data.subscriptionId;
              return { subscriptionId: data.subscriptionId };
            }}
            onApprove={async (data) => {
              const subscriptionId =
                (data as { subscriptionId?: string }).subscriptionId ?? subscriptionIdRef.current;
              await postJson("/api/checkout/paypal/subscriptions/activate", { subscriptionId });
              await update(); // refresca el token con los datos de la suscripción
              toast.success("¡Suscripción activada!");
              router.push("/dashboard/profile");
            }}
            onError={(error) =>
              toast.error(error instanceof Error ? error.message : "Error con PayPal")
            }
          />
        </PayPalProvider>
      ) : (
        <Button className="w-full" disabled>
          {paypalReason}
        </Button>
      )}
    </div>
  );
}
