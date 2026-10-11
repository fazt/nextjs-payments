import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "@/app/(landingLayout)/page";
import ProductCard from "@/components/products/ProductCard";
import { useCartStore } from "@/store/cartStore";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const baseProduct = {
  id: 1,
  name: "Audífonos inalámbricos",
  price: 59.9,
  image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  description: "<p>Con <strong>cancelación</strong> de ruido</p>",
  stock: 4,
  authorName: "Admin",
  categories: ["Electrónica"],
};

describe("LandingPage", () => {
  it("muestra el hero de la portada", () => {
    render(<LandingPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /deploy to the cloud with confidence/i })
    ).toBeInTheDocument();
  });
});

describe("ProductCard", () => {
  beforeEach(() => useCartStore.getState().clearCart());

  it("muestra nombre, precio, categorías y la descripción sin HTML", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Audífonos inalámbricos")).toBeInTheDocument();
    expect(screen.getByText(/59[.,]90/)).toBeInTheDocument();
    expect(screen.getByText("Electrónica")).toBeInTheDocument();
    expect(screen.getByText("Con cancelación de ruido")).toBeInTheDocument();
  });

  it("añade el producto al carrito", async () => {
    render(<ProductCard product={baseProduct} />);
    await userEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));
    expect(useCartStore.getState().cart).toEqual([
      expect.objectContaining({ id: 1, quantity: 1, price: 59.9 }),
    ]);
  });

  it("deshabilita el botón si no hay stock", () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0, image: null }} />);
    expect(screen.getByText("Agotado")).toBeInTheDocument();
    expect(screen.getByText("Sin imagen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir al carrito" })).toBeDisabled();
  });
});
