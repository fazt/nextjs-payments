import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Sesión que devuelven `useSession`, `getSession` y `getServerSession`. */
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      lastname: string;
      role: string;
      subscriptionId: string | null;
    } & Omit<DefaultSession["user"], "name" | "email">;
  }

  /** Usuario que devuelve `authorize` del proveedor de credenciales. */
  interface User {
    id: string;
    lastname: string;
    role: string;
    subscriptionId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    lastname: string;
    role: string;
    subscriptionId: string | null;
  }
}
