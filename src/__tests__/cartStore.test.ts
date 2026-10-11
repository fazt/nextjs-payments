import { act } from "@testing-library/react";
import { cartCount, useCartStore } from "@/store/cartStore";

const product = { id: 1, name: "Audífonos", price: 59.9, image: null, stock: 5 };

beforeEach(() => {
  act(() => useCartStore.getState().clearCart());
});

describe("cartStore", () => {
  it("añade productos y acumula cantidades", () => {
    act(() => {
      useCartStore.getState().addToCart(product);
      useCartStore.getState().addToCart(product);
    });
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    expect(cartCount(cart)).toBe(2);
  });

  it("guarda solo los campos necesarios del producto", () => {
    act(() =>
      useCartStore.getState().addToCart({ ...product, author: { password: "x" } } as never)
    );
    expect(useCartStore.getState().cart[0]).not.toHaveProperty("author");
  });

  it("aumenta, disminuye (mínimo 1) y elimina", () => {
    act(() => useCartStore.getState().addToCart(product));
    act(() => useCartStore.getState().increase(1));
    expect(useCartStore.getState().cart[0].quantity).toBe(2);

    act(() => {
      useCartStore.getState().decrease(1);
      useCartStore.getState().decrease(1);
    });
    expect(useCartStore.getState().cart[0].quantity).toBe(1);

    act(() => useCartStore.getState().removeFromCart({ id: 1 }));
    expect(useCartStore.getState().cart).toHaveLength(0);
  });

  it("persiste el carrito en localStorage", () => {
    act(() => useCartStore.getState().addToCart(product));
    const stored = JSON.parse(window.localStorage.getItem("cartStore") ?? "{}");
    expect(stored.state.cart[0].id).toBe(1);
  });
});
