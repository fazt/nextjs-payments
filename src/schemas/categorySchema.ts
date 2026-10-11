import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" })
    .max(255),
  description: z
    .string({ error: "La descripción debe ser un texto" })
    .trim()
    .max(1000)
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
