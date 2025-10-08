"use client";

import { Edit, Trash2 } from "lucide-react";
import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick: (itemId: string) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.header)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {col.header}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item.id)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              {columns.map((col) => (
                <td
                  key={String(col.header)}
                  className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}
                >
                  {typeof col.accessor === "function"
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
              <td
                className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                onClick={handleActionClick}
              >
                <button
                  title="Editar"
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit size={18} />
                </button>
                <button
                  title="Excluir"
                  onClick={() => onDelete(item)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
