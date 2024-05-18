"use client";
import { Card, Button } from "@/components/ui";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PaypalButton } from "./paypal-button";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";

initMercadoPago("TEST-4dd4f7db-2104-497f-b849-9953b57cb77e");

export function CartList() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const router = useRouter();
  const [preferenceId, setPreferenceId] = useState("");

  const { data: session } = useSession();

  useEffect(() => {
    async function load() {
      if (cart.length === 0) return;

      const res = await fetch("/api/payments/mercadopago/checkout", {
        method: "POST",
        body: JSON.stringify(cart),
      });
      const data = await res.json();

      console.log(data);
      setPreferenceId(data.id);
    }
    load();
  }, [cart]);

  return (
    <div>
      {cart.map((product) => (
        <Card key={product.id}>
          <div className="flex justify-between">
            <div>
              <img
                src={product.image}
                alt=""
                className="w-32 h-32 object-cover object-center"
              />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>{product.price}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex mb-5">
                <Button>-</Button>
                <span>{product.quantity}</span>
                <Button>+</Button>
              </div>
              <Button onClick={() => removeFromCart(product)}>
                Remove from cart
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={async () => {
            if (!session) {
              return router.push("/auth/login");
            }

            const result = await fetch("/api/checkout", {
              method: "POST",
              body: JSON.stringify(cart),
            });
            const data = await result.json();

            if (result.ok) {
              window.location.href = data.url;
            }
          }}
        >
          Pagar {cart.reduce((acc, p) => acc + p.price * p.quantity, 0)}
        </Button>
        <PaypalButton />
        <Button
          className="bg-blue-500 hover:bg-blue-700"
          onClick={async () => {
            const res = await fetch("/api/payments/mercadopago/checkout", {
              method: "POST",
              body: JSON.stringify(cart),
            });
            const data = await res.json();
            console.log(data);

            window.location.href = data.init_point;
          }}
        >
          Pagar con MercadoPago
        </Button>

        {/* <div id="wallet_container"></div> */}

        {preferenceId && (
          <Wallet
            initialization={{ preferenceId: preferenceId }}
            customization={{ texts: { valueProp: "smart_option" } }}
          />
        )}
      </div>
    </div>
  );
}
