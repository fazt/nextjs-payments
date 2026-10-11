/* eslint-disable no-console -- script de línea de comandos */
/**
 * Datos de ejemplo: un admin, un usuario, categorías, productos y planes.
 * Se puede ejecutar varias veces (no duplica registros): npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN = { email: "admin@example.com", password: "admin123", name: "Admin", last_name: "Fazt" };
const USER = { email: "user@example.com", password: "user1234", name: "Usuario", last_name: "Demo" };

const categories = [
  { name: "Electrónica", description: "Audio, cámaras y gadgets" },
  { name: "Ropa y calzado", description: "Zapatillas y accesorios" },
  { name: "Hogar", description: "Productos para la casa y el escritorio" },
];

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const products = [
  {
    slug: "audifonos-inalambricos",
    name: "Audífonos inalámbricos",
    price: 59.9,
    stock: 25,
    image: unsplash("photo-1505740420928-5e560c06d30e"),
    description: "<p>Audífonos over-ear con cancelación de ruido y 30 horas de batería.</p>",
    categories: ["Electrónica"],
  },
  {
    slug: "reloj-minimalista",
    name: "Reloj minimalista",
    price: 89.5,
    stock: 12,
    image: unsplash("photo-1523275335684-37898b6baf30"),
    description: "<p>Reloj analógico con correa de cuero y caja de acero.</p>",
    categories: ["Ropa y calzado"],
  },
  {
    slug: "zapatillas-running",
    name: "Zapatillas running",
    price: 74.99,
    stock: 18,
    image: unsplash("photo-1542291026-7eec264c27ff"),
    description: "<p>Zapatillas ligeras con amortiguación para entrenar todos los días.</p>",
    categories: ["Ropa y calzado"],
  },
  {
    slug: "camara-instantanea",
    name: "Cámara instantánea",
    price: 129,
    stock: 6,
    image: unsplash("photo-1526170375885-4d8ecf77b99f"),
    description: "<p>Cámara de fotos instantáneas con flash automático.</p>",
    categories: ["Electrónica"],
  },
  {
    slug: "lentes-de-sol",
    name: "Lentes de sol",
    price: 35,
    stock: 40,
    image: unsplash("photo-1572635196237-14b3f281503f"),
    description: "<p>Lentes polarizados con protección UV400.</p>",
    categories: ["Ropa y calzado"],
  },
  {
    slug: "lampara-de-escritorio",
    name: "Lámpara de escritorio",
    price: 24.9,
    stock: 0,
    image: null,
    description: "<p>Lámpara LED regulable. Sin stock para probar el estado \"Agotado\".</p>",
    categories: ["Hogar"],
  },
];

const plans = [
  {
    name: "Básico",
    description: "Para empezar a vender sin complicaciones.",
    price: 9.99,
    features: ["Hasta 10 productos", "Pagos con Stripe y PayPal", "Soporte por correo"],
  },
  {
    name: "Pro",
    description: "Para tiendas que están creciendo.",
    price: 19.99,
    features: ["Productos ilimitados", "Mercado Pago incluido", "Reportes de ventas"],
  },
  {
    name: "Premium",
    description: "Todo lo que necesitas y soporte prioritario.",
    price: 29.99,
    features: ["Todo lo del plan Pro", "Soporte prioritario", "Dominio personalizado"],
  },
];

async function upsertUser(data: typeof ADMIN, role: "admin" | "user") {
  const password = await bcrypt.hash(data.password, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: { role, password },
    create: { ...data, password, role, confirmed_email: true },
  });
}

async function main() {
  const admin = await upsertUser(ADMIN, "admin");
  await upsertUser(USER, "user");

  const categoryIds = new Map<string, number>();
  for (const category of categories) {
    const existing = await prisma.category.findFirst({ where: { name: category.name } });
    const saved = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: category })
      : await prisma.category.create({ data: category });
    categoryIds.set(category.name, saved.id);
  }

  for (const { categories: names, ...product } of products) {
    const categoryLinks = names.map((name) => ({ categoryId: categoryIds.get(name)! }));
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categories: { deleteMany: {}, create: categoryLinks } },
      create: { ...product, authorId: admin.id, categories: { create: categoryLinks } },
    });
  }

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: plan.name } });
    if (existing) {
      // No se tocan los ids de Stripe/PayPal ya sincronizados
      await prisma.subscriptionPlan.update({ where: { id: existing.id }, data: plan });
    } else {
      await prisma.subscriptionPlan.create({ data: plan });
    }
  }

  console.log("Seed completado:");
  console.log(`  admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`  usuario: ${USER.email} / ${USER.password}`);
  console.log(`  ${categories.length} categorías, ${products.length} productos, ${plans.length} planes`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
