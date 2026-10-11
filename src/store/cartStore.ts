import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Datos mínimos del producto que se guardan en el carrito (el precio real lo pone el servidor). */
export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string | null;
  description?: string | null;
  stock?: number | null;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (product: Pick<CartProduct, "id">) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product) =>
        set((state) => {
          const inCart = state.cart.find((item) => item.id === product.id);
          if (inCart) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          const { id, name, price, image, description, stock } = product;
          return {
            cart: [...state.cart, { id, name, price, image, description, stock, quantity: 1 }],
          };
        }),
      removeFromCart: (product) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== product.id) })),
      increase: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item
          ),
        })),
      decrease: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "cartStore" }
  )
);

/** Total de unidades del carrito. */
export function cartCount(cart: CartItem[]) {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}

/**
 * El carrito vive en localStorage: en el servidor siempre está vacío. Este hook
 * evita errores de hidratación devolviendo `false` hasta montar en el cliente.
 */
const noopSubscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
