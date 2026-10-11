import { z } from "zod";

const slug = z
  .string()
  .trim()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error: "Usa solo minúsculas, números y guiones (ej. audifonos-bluetooth)",
  });

const isFileList = (value: unknown): value is FileList =>
  typeof FileList !== "undefined" && value instanceof FileList;

/** Formulario del panel (los inputs numéricos llegan como texto). */
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" })
    .max(255),
  description: z.string().optional(),
  price: z.coerce
    .number<string>({ error: "El precio debe ser un número" })
    .positive({ error: "El precio debe ser mayor que 0" }),
  stock: z.coerce
    .number<string>({ error: "El stock debe ser un número" })
    .int({ error: "El stock debe ser un número entero" })
    .min(0, { error: "El stock no puede ser negativo" }),
  // FileList solo existe en el navegador: z.instanceof(FileList) rompería el SSR.
  image: z.custom<FileList>((value) => value === undefined || isFileList(value)).optional(),
  slug: slug.or(z.literal("")).optional(),
  categories: z.array(z.number()).optional(),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

/** Cuerpo que aceptan POST /api/products y PUT /api/products/:id. */
export const productApiSchema = z.object({
  name: z.string().trim().min(3).max(255),
  description: z.string().max(20_000).nullish(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  image: z.url().nullish(),
  slug: slug.or(z.literal("")).nullish(),
  categories: z.array(z.coerce.number().int().positive()).default([]),
});

export type ProductApiInput = z.infer<typeof productApiSchema>;
