"use client";
import { useCartStore } from "@/store/cartStore";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function PaypalButton() {
  const cart = useCartStore((state) => state.cart);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <PayPalScriptProvider
      options={{ clientId: `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}` }}
    >
      <PayPalButtons
        style={{ layout: "horizontal", color: "blue" }}
        createOrder={async (data, actions) => {
          // valida si el usuario esta logueado
          if (!session) {
            return router.push("/auth/login");
          }

          // genera la orden de compra
          const response = await fetch("/api/checkout/paypal", {
            method: "POST",
            body: JSON.stringify(cart),
          });
          const dataResponse = await response.json();

          return dataResponse.id;
        }}
        onApprove={(data, actions) => {
          actions.order.capture();
        }}
        onCancel={(data, actions) => {
          console.log(data, actions);
        }}
      />
    </PayPalScriptProvider>
  );
}
