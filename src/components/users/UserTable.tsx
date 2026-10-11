"use client";

import { Badge, Table, type TableColumn } from "../ui";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  subscription: string;
  orders: number;
  created_at: string;
}

interface Props {
  users: UserRow[];
}

const columns: TableColumn<UserRow>[] = [
  { header: "Nombre", accessorKey: "name" },
  { header: "Correo", accessorKey: "email" },
  {
    header: "Rol",
    accessorKey: "role",
    cell: (info) => <Badge>{info.row.original.role}</Badge>,
  },
  { header: "Suscripción", accessorKey: "subscription" },
  { header: "Pedidos", accessorKey: "orders" },
  { header: "Registro", accessorKey: "created_at" },
];

function UserTable({ users }: Props) {
  return <Table data={users} columns={columns} emptyMessage="No hay usuarios" />;
}

export default UserTable;
