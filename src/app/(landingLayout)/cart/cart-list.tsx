"use client";
import { Card, Button } from "@/components/ui";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PaypalButton } from "./paypal-button";

export function CartList() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const router = useRouter();

  const { data: session } = useSession();

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
            });
            const data = await res.json();
            console.log(data);
          }}
        >
          Pagar con MercadoPago
        </Button>
      </div>
    </div>
  );
}
