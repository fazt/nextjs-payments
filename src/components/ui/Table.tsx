"use client";

import { tableFeatures, useTable, type ColumnDef, type RowData } from "@tanstack/react-table";

// TanStack Table v9: cada tabla declara las features que usa (aquí ninguna).
const features = tableFeatures({});

export type TableColumn<TData extends RowData> = ColumnDef<typeof features, TData>;

interface Props<TData extends RowData> {
  data: TData[];
  columns: TableColumn<TData>[];
  emptyMessage?: string;
}

export function Table<TData extends RowData>({
  data,
  columns,
  emptyMessage = "Sin registros",
}: Props<TData>) {
  const table = useTable({ features, columns, data });

  return (
    <table className="min-w-full divide-y divide-gray-300 mb-4">
      <thead className="bg-gray-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {table.getRowModel().rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        )}
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
