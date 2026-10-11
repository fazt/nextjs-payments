"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Modal, Table, type TableColumn } from "../ui";

export interface CategoryRow {
  id: number;
  name: string;
  description: string;
  products: number;
  created_at: string;
}

interface Props {
  categories: CategoryRow[];
}

function CategoriesTable({ categories }: Props) {
  const [selected, setSelected] = useState<CategoryRow | null>(null);
  const router = useRouter();

  async function handleDelete(id: number) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      toast.success("Categoría eliminada");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "No se pudo eliminar la categoría");
    }
    setSelected(null);
  }

  const columns: TableColumn<CategoryRow>[] = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Descripción", accessorKey: "description" },
    { header: "Productos", accessorKey: "products" },
    { header: "Creada", accessorKey: "created_at" },
    {
      header: "Acciones",
      id: "actions",
      cell: (info) => (
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setSelected(info.row.original)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table data={categories} columns={columns} emptyMessage="Aún no hay categorías" />
      <Modal
        open={selected !== null}
        setOpen={(open) => !open && setSelected(null)}
        title="¿Eliminar categoría?"
      >
        <p className="text-slate-400">
          Se eliminará <strong className="text-slate-200">{selected?.name}</strong> y se quitará
          de sus productos (los productos no se borran).
        </p>
        <div className="mt-2 flex justify-end gap-x-2">
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => selected && handleDelete(selected.id)}
          >
            Sí, eliminar
          </Button>
          <Button onClick={() => setSelected(null)}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}

export default CategoriesTable;
