"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { toast } from "sonner";
import type { Category } from "@/generated/prisma/browser";
import { Input, Label, Button, Card, QuillEditor } from "@/components/ui";
import { productFormSchema } from "@/schemas/productSchema";

export interface ProductFormValues {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number | null;
  image: string | null;
  slug: string | null;
  categories: number[];
}

interface Props {
  categories: Pick<Category, "id" | "name">[];
  /** Si se pasa, el formulario edita ese producto en lugar de crear uno nuevo */
  product?: ProductFormValues;
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-500">{message}</p> : null;
}

function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      stock: product ? String(product.stock ?? 0) : "0",
      slug: product?.slug ?? "",
      categories: product?.categories ?? [],
    },
  });

  const imageFiles = useWatch({ control, name: "image" });
  const previewUrl = useMemo(
    () => (imageFiles && imageFiles.length > 0 ? URL.createObjectURL(imageFiles[0]) : null),
    [imageFiles]
  );

  const options = categories.map((category) => ({ value: category.id, label: category.name }));

  const onSubmit = handleSubmit(async ({ image, ...data }) => {
    let imageUrl: string | undefined;

    if (image && image.length > 0) {
      const formData = new FormData();
      formData.append("file", image[0]);
      const upload = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await upload.json();
      if (!upload.ok) {
        toast.error(uploadData.error ?? "No se pudo subir la imagen");
        return;
      }
      imageUrl = uploadData.secure_url;
    }

    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, image: imageUrl }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "No se pudo guardar el producto");
      return;
    }

    toast.success(product ? "Producto actualizado" : "Producto creado");
    router.push("/dashboard/products");
    router.refresh();
  });

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Card>
        <h1 className="mb-4 text-xl font-bold text-gray-900">
          {product ? "Editar producto" : "Nuevo producto"}
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-y-2">
          <Label>Nombre del Producto</Label>
          <Input {...register("name")} />
          <ErrorText message={errors.name?.message} />

          <Label>Descripción</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <QuillEditor value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />

          <Label>Precio (USD)</Label>
          <Input {...register("price")} type="number" step="0.01" min="0" />
          <ErrorText message={errors.price?.message} />

          <Label>Stock</Label>
          <Input {...register("stock")} type="number" step="1" min="0" />
          <ErrorText message={errors.stock?.message} />

          <Label>Imagen</Label>
          {product?.image && !previewUrl && (
            <Image
              src={product.image}
              alt={product.name}
              className="h-20 w-20 object-cover"
              width={80}
              height={80}
            />
          )}
          <Input type="file" accept="image/*" {...register("image")} />
          {previewUrl && (
            // Vista previa local (blob:) que next/image no puede optimizar
            <Image
              src={previewUrl}
              alt="Vista previa"
              className="h-20 w-20 object-cover"
              width={80}
              height={80}
              unoptimized
            />
          )}

          <Label>Categorías</Label>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <Select
                instanceId="product-categories"
                isMulti
                options={options}
                value={options.filter((option) => field.value?.includes(option.value))}
                onChange={(selected) => field.onChange(selected.map((option) => option.value))}
              />
            )}
          />

          <Label>Slug (opcional)</Label>
          <Input {...register("slug")} placeholder="audifonos-bluetooth" />
          <ErrorText message={errors.slug?.message} />

          <Button className="mt-2 block" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : product ? "Guardar cambios" : "Crear Producto"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ProductForm;
