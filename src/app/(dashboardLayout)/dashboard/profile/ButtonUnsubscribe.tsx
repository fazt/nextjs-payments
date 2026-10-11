"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui";

export function ButtonUnsubscribe() {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="bg-red-500 hover:bg-red-600"
      disabled={loading}
      onClick={async () => {
        if (!confirm("¿Seguro que quieres cancelar tu suscripción?")) return;
        setLoading(true);
        const res = await fetch("/api/checkout/subscription/cancel", { method: "POST" });
        const body = await res.json().catch(() => ({}));
        setLoading(false);

        if (!res.ok) {
          toast.error(body.error ?? "No se pudo cancelar la suscripción");
          return;
        }

        await update(); // relee la suscripción desde la base de datos
        toast.success("Suscripción cancelada");
        router.refresh();
      }}
    >
      {loading ? "Cancelando…" : "Cancelar suscripción"}
    </Button>
  );
}
