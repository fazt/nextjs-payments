import { loginSchema, registerSchema } from "@/schemas/authSchema";
import { createCategorySchema } from "@/schemas/categorySchema";
import { productApiSchema, productFormSchema } from "@/schemas/productSchema";

describe("authSchema", () => {
  it("valida el login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123456" }).success).toBe(true);
    const bad = loginSchema.safeParse({ email: "no-es-correo", password: "123" });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues.map((issue) => issue.path[0])).toEqual(["email", "password"]);
  });

  it("exige nombre y apellido en el registro", () => {
    const result = registerSchema.safeParse({
      name: " ",
      lastname: "",
      email: "a@b.com",
      password: "123456",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("El nombre es obligatorio");
  });
});

describe("categorySchema", () => {
  it("pide al menos 3 caracteres", () => {
    expect(createCategorySchema.safeParse({ name: "TV" }).success).toBe(false);
    expect(createCategorySchema.safeParse({ name: "Audio" }).success).toBe(true);
  });
});

describe("productFormSchema", () => {
  it("convierte precio y stock del formulario a números", () => {
    const result = productFormSchema.parse({
      name: "Audífonos",
      price: "59.90",
      stock: "3",
      slug: "audifonos-bt",
      categories: [1],
    });
    expect(result.price).toBe(59.9);
    expect(result.stock).toBe(3);
  });

  it("rechaza precios no positivos, stock decimal y slugs inválidos", () => {
    const result = productFormSchema.safeParse({
      name: "Audífonos",
      price: "0",
      stock: "1.5",
      slug: "Con Espacios",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual([
      "price",
      "slug",
      "stock",
    ]);
  });
});

describe("productApiSchema", () => {
  it("acepta el cuerpo de la API y pone categorías vacías por defecto", () => {
    const result = productApiSchema.parse({
      name: "Reloj",
      price: 10,
      stock: 0,
      image: "https://res.cloudinary.com/demo/image/upload/reloj.png",
    });
    expect(result.categories).toEqual([]);
  });

  it("rechaza imágenes que no son URL", () => {
    expect(
      productApiSchema.safeParse({ name: "Reloj", price: 10, stock: 0, image: "reloj.png" }).success
    ).toBe(false);
  });
});
