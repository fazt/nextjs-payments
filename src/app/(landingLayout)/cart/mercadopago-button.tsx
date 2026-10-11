"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";

interface Props {
  enabled: boolean;
  publicKey: string | null;
  items: { id: number; quantity: number }[];
}

/**
 * Checkout Pro de Mercado Pago. Crea la preferencia en el servidor y, si hay
 * public key, muestra el Wallet Brick; si no, redirige directamente a init_point.
 */
export function MercadoPagoButton({ enabled, publicKey, items }: Props) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) initMercadoPago(publicKey, { locale: "es-PE" });
  }, [publicKey]);

  if (!enabled) return <Button disabled>Mercado Pago (no disponible)</Button>;

  if (preferenceId && publicKey) {
    return <Wallet initialization={{ preferenceId }} locale="es-PE" />;
  }

  async function createPreference() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");

      if (publicKey) {
        setPreferenceId(data.id);
        setLoading(false);
      } else {
        window.location.href = data.init_point;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error con Mercado Pago");
      setLoading(false);
    }
  }

  return (
    <Button className="bg-sky-500 hover:bg-sky-600" onClick={createPreference} disabled={loading}>
      {loading ? "Preparando…" : "Pagar con Mercado Pago"}
    </Button>
  );
}
