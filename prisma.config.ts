import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Se usa process.env (y no env()) para que `prisma generate` funcione
    // sin base de datos, por ejemplo en `npm install` o en CI.
    url: process.env.DATABASE_URL,
  },
});
