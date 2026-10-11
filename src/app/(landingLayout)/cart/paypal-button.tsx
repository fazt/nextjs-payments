"use client";

import { toast } from "sonner";
import {
  INSTANCE_LOADING_STATE,
  PayPalOneTimePaymentButton,
  PayPalProvider,
  usePayPal,
} from "@paypal/react-paypal-js/sdk-v6";

interface Props {
  clientId: string;
  environment: "sandbox" | "production";
  items: { id: number; quantity: number }[];
  onPaid: () => void;
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

function Buttons({ items, onPaid }: Pick<Props, "items" | "onPaid">) {
  const { loadingStatus } = usePayPal();

  if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
    return <p className="text-center text-sm text-gray-500">Cargando PayPal…</p>;
  }
  if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED) {
    return <p className="text-center text-sm text-red-600">PayPal no se pudo cargar</p>;
  }

  return (
    <PayPalOneTimePaymentButton
      // 1) el servidor crea la orden con los precios de la base de datos
      createOrder={async () => {
        const data = await postJson("/api/checkout/paypal", items);
        return { orderId: data.id };
      }}
      // 2) tras la aprobación del comprador, el servidor la cobra y registra el pedido
      onApprove={async ({ orderId }) => {
        await postJson("/api/checkout/paypal/capture", { orderId });
        onPaid();
      }}
      onCancel={() => toast.info("Pago con PayPal cancelado")}
      onError={(error) =>
        toast.error(error instanceof Error ? error.message : "Error al pagar con PayPal")
      }
    />
  );
}

/** Botón de PayPal con el SDK JS v6 (`@paypal/react-paypal-js/sdk-v6`). */
export function PaypalButton({ clientId, environment, items, onPaid }: Props) {
  return (
    <PayPalProvider
      clientId={clientId}
      environment={environment}
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <Buttons items={items} onPaid={onPaid} />
    </PayPalProvider>
  );
}
