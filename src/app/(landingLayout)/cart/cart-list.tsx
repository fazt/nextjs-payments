"use client";
import { Card, Button } from "@/components/ui";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
            <div className="flex items-center">
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

            window.location.href = data.url;
          }}
        >
          Pagar {cart.reduce((acc, p) => acc + p.price, 0)} $
        </Button>
      </div>
    </div>
  );
}
