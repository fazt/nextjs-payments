import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Ruta de la app para cargar next.config y los archivos .env en los tests.
  // Los paquetes de `transpilePackages` (p. ej. TanStack Table, solo ESM) se transforman.
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

// next/jest carga la configuración de Next de forma asíncrona
export default createJestConfig(config);
