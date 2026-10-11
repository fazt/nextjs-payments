"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";

interface Props {
  disabled: boolean;
  pending: number;
}

export function SyncPaypalButton({ disabled, pending }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="mt-4 sm:mt-0"
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/payments/paypal/plans/sync", { method: "POST" });
        const body = await res.json().catch(() => ({}));
        setLoading(false);
        if (!res.ok) {
          toast.error(body.error ?? "No se pudieron sincronizar los planes");
        } else {
          toast.success(`${body.synced.length} planes sincronizados con PayPal`);
        }
        router.refresh();
      }}
    >
      {loading ? "Sincronizando…" : `Sincronizar con PayPal (${pending})`}
    </Button>
  );
}
