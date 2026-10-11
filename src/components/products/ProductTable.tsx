"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, Badge, Button, Modal, Table, type TableColumn } from "../ui";

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  image: string | null;
  slug: string | null;
  author: string;
  categories: string[];
}

interface Props {
  products: ProductRow[];
}

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });

function ProductTable({ products }: Props) {
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const router = useRouter();

  async function handleDeleteProduct(id: number) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

    if (res.status === 204) {
      toast.success("Producto eliminado");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "No se pudo eliminar el producto");
    }
    setSelected(null);
  }

  const columns: TableColumn<ProductRow>[] = [
    { header: "Nombre", accessorKey: "name" },
    {
      header: "Precio",
      accessorKey: "price",
      cell: (info) => money.format(info.row.original.price),
    },
    { header: "Stock", accessorKey: "stock" },
    {
      header: "Imagen",
      accessorKey: "image",
      cell: (info) => <Avatar src={info.row.original.image} alt={info.row.original.name} />,
    },
    { header: "Slug", accessorKey: "slug" },
    {
      header: "Categorías",
      accessorKey: "categories",
      cell: (info) => (
        <div className="flex gap-x-2">
          {info.row.original.categories.map((name) => (
            <Badge key={name}>{name}</Badge>
          ))}
        </div>
      ),
    },
    { header: "Autor", accessorKey: "author" },
    {
      header: "Acciones",
      id: "actions",
      cell: (info) => (
        <div className="flex gap-x-2">
          <Button href={`/dashboard/products/${info.row.original.id}/edit`}>Editar</Button>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => setSelected(info.row.original)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table data={products} columns={columns} emptyMessage="Aún no hay productos" />
      <Modal
        open={selected !== null}
        setOpen={(open) => !open && setSelected(null)}
        title="¿Eliminar producto?"
      >
        <p className="text-slate-400">
          Se eliminará <strong className="text-slate-200">{selected?.name}</strong>. Esta acción no
          se puede deshacer. Los productos con pedidos se conservan para no romper el historial.
        </p>
        <div className="mt-2 flex justify-end gap-x-2">
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => selected && handleDeleteProduct(selected.id)}
          >
            Sí, eliminar
          </Button>
          <Button onClick={() => setSelected(null)}>Cancelar</Button>
        </div>
      </Modal>
    </>
  );
}

export default ProductTable;
