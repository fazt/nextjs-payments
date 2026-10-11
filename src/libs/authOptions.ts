import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import prisma from "@/libs/prisma";
import { loginSchema } from "@/schemas/authSchema";

const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

/** Datos del usuario que viajan en el JWT (nunca la contraseña). */
async function loadTokenUser(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      last_name: true,
      email: true,
      role: true,
      subscriptionId: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    lastname: user.last_name,
    email: user.email,
    role: user.role ?? "user",
    subscriptionId: user.subscriptionId,
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error(INVALID_CREDENTIALS);

        const userFound = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: { id: true, password: true },
        });
        if (!userFound) throw new Error(INVALID_CREDENTIALS);

        const matchPassword = await bcrypt.compare(parsed.data.password, userFound.password);
        if (!matchPassword) throw new Error(INVALID_CREDENTIALS);

        const user = await loadTokenUser(userFound.id);
        if (!user) throw new Error(INVALID_CREDENTIALS);

        return { ...user, id: String(user.id) };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.lastname = user.lastname;
        token.subscriptionId = user.subscriptionId ?? null;
      }

      // `update()` desde el cliente solo sirve para refrescar el token con los
      // datos de la base de datos (p. ej. tras suscribirse); nunca se copian
      // valores enviados por el navegador.
      if (trigger === "update" && token.id) {
        const fresh = await loadTokenUser(token.id);
        if (fresh) {
          token.name = fresh.name;
          token.email = fresh.email;
          token.role = fresh.role;
          token.lastname = fresh.lastname;
          token.subscriptionId = fresh.subscriptionId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name ?? "",
        email: token.email ?? "",
        lastname: token.lastname,
        role: token.role,
        subscriptionId: token.subscriptionId ?? null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
