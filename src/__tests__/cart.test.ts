import {
  cartSchema,
  cartTotal,
  CheckoutError,
  decodeCartLines,
  encodeCartLines,
  formatAmount,
  mergeCartLines,
  priceCart,
  toCents,
} from "@/libs/cart";

const products = [
  { id: 1, name: "Audífonos", price: 59.9, stock: 10 },
  { id: 2, name: "Reloj", price: 19.99, stock: 1 },
  { id: 3, name: "Lámpara", price: 24.9, stock: 0 },
];

describe("importes", () => {
  it("convierte a centavos sin errores de coma flotante", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(59.9)).toBe(5990);
  });

  it("formatea con dos decimales", () => {
    expect(formatAmount(10)).toBe("10.00");
    expect(formatAmount(19.999)).toBe("20.00");
  });

  it("suma las líneas en centavos", () => {
    expect(cartTotal([{ unitPrice: 19.99, quantity: 3 }, { unitPrice: 0.1, quantity: 2 }])).toBe(
      60.17
    );
  });
});

describe("cartSchema", () => {
  it("acepta ids y cantidades (también como texto)", () => {
    expect(cartSchema.parse([{ id: "1", quantity: "2" }])).toEqual([{ id: 1, quantity: 2 }]);
  });

  it("rechaza carritos vacíos o cantidades inválidas", () => {
    expect(cartSchema.safeParse([]).success).toBe(false);
    expect(cartSchema.safeParse([{ id: 1, quantity: 0 }]).success).toBe(false);
    expect(cartSchema.safeParse([{ id: -1, quantity: 1 }]).success).toBe(false);
  });

  it("ignora el precio que manda el cliente", () => {
    const parsed = cartSchema.parse([{ id: 1, quantity: 1, price: 0.01 }]);
    expect(parsed[0]).not.toHaveProperty("price");
  });
});

describe("priceCart", () => {
  it("usa los precios de la base de datos y agrupa líneas repetidas", () => {
    const lines = priceCart(
      [
        { id: 1, quantity: 1 },
        { id: 1, quantity: 2 },
      ],
      products
    );
    expect(lines).toEqual([{ productId: 1, quantity: 3, name: "Audífonos", unitPrice: 59.9 }]);
  });

  it("falla si el producto no existe", () => {
    expect(() => priceCart([{ id: 99, quantity: 1 }], products)).toThrow(CheckoutError);
  });

  it("falla con 409 si no hay stock suficiente", () => {
    try {
      priceCart([{ id: 2, quantity: 2 }], products);
      throw new Error("debió fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(CheckoutError);
      expect((error as CheckoutError).status).toBe(409);
    }
    expect(() => priceCart([{ id: 3, quantity: 1 }], products)).toThrow(/stock/);
  });
});

describe("metadatos del carrito", () => {
  it("codifica y decodifica las líneas", () => {
    const lines = mergeCartLines([
      { id: 3, quantity: 2 },
      { id: 7, quantity: 1 },
    ]);
    const encoded = encodeCartLines(lines);
    expect(encoded).toBe("3x2,7x1");
    expect(decodeCartLines(encoded)).toEqual(lines);
  });

  it("descarta valores corruptos", () => {
    expect(decodeCartLines("3x2,abc,4x0,-1x2,5x1")).toEqual([
      { productId: 3, quantity: 2 },
      { productId: 5, quantity: 1 },
    ]);
    expect(decodeCartLines(undefined)).toEqual([]);
  });
});
