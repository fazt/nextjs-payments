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
      addToCart: (product) =>
        set((state) => ({ cart: [...state.cart, product] })),
      removeFromCart: (product) =>
        set((state) => ({
          cart: state.cart.filter((p) => p.id !== product.id),
        })),
    }),
    { name: "cartStore" }
  )
);
