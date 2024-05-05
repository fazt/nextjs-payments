import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CartStore {
  cart: any[];
  addToCart: (product: any) => void;
  removeFromCart: (product: any) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product) => {
        // obtener el estado del carrito
        const cart = useCartStore.getState().cart;

        const productInCart = cart.find((p) => p.id === product.id);

        if (productInCart) {
          const newCart = cart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          );
          set((state) => ({
            cart: newCart,
          }));
          return;
        }

        set((state) => ({
          cart: [
            ...state.cart,
            {
              ...product,
              quantity: 1,
            },
          ],
        }));
      },
      removeFromCart: (product) =>
        set((state) => ({
          cart: state.cart.filter((p) => p.id !== product.id),
        })),
    }),
    { name: "cartStore" }
  )
);
