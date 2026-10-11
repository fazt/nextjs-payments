import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, { error: "El correo es obligatorio" })
  .pipe(z.email({ error: "Ingresa un correo válido" }));

const password = z
  .string()
  .min(6, { error: "La contraseña debe tener al menos 6 caracteres" })
  .max(72, { error: "La contraseña no puede superar los 72 caracteres" });

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, { error: "El nombre es obligatorio" }).max(100),
  lastname: z.string().trim().min(1, { error: "El apellido es obligatorio" }).max(100),
  email,
  password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
