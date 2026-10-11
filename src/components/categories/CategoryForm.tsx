"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Card, Input, Label } from "@/components/ui";
import { createCategorySchema } from "@/schemas/categorySchema";

function CategoryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
  });
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "No se pudo crear la categoría");
      return;
    }

    toast.success("Categoría creada");
    router.push("/dashboard/categories");
    router.refresh();
  });

  return (
    <div className="mx-auto max-w-xl px-4">
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-y-2">
          <Label>Nombre de la Categoría</Label>
          <Input {...register("name")} />
          {errors.name?.message && <p className="text-xs text-red-500">{errors.name.message}</p>}

          <Label>Descripción de la Categoría</Label>
          <Input {...register("description")} />

          <Button className="mt-2 block" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Crear Categoría"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default CategoryForm;
