"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

export function ButtonSubscribe() {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        const result = await fetch("/api/checkout/subscription", {
          method: "POST",
        });
        const data = await result.json();

        window.location.href = data.url;
      }}
    >
      Subscribe
    </Button>
  );
}
