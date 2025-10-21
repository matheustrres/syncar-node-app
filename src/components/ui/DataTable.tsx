"use client";

import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import React, { useState } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick: (itemId: string) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
  onSort,
  onBulkDelete,
  sortColumn,
  sortDirection,
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleHeaderClick = (columnAccessor: string) => {
    if (sortColumn === columnAccessor) {
      onSort(columnAccessor, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnAccessor, "asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(data.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isAllSelected = selectedItems.length === data.length && data.length > 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      {selectedItems.length > 0 && onBulkDelete && (
        <div className="p-4 bg-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedItems.length} item(s) selecionado(s)
          </span>
          <button
            onClick={() => onBulkDelete(selectedItems)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </th>
            {columns.map((col) => (
              <th
                key={String(col.header)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.sortable ? "cursor-pointer select-none" : ""}`}
                onClick={
                  col.sortable
                    ? () => handleHeaderClick(String(col.accessor))
                    : undefined
                }
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    sortColumn === col.accessor &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    ))}
                </div>
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
              className={`hover:bg-gray-50 cursor-pointer ${selectedItems.includes(item.id) ? "bg-gray-100" : ""}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </td>
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
