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
    <div className="overflow-x-auto rounded-syncar-panel border border-syncar-border bg-syncar-surface shadow-sm">
      {selectedItems.length > 0 && onBulkDelete && (
        <div className="flex items-center justify-between border-b border-syncar-border bg-syncar-surface-subtle p-4">
          <span className="text-sm font-medium text-syncar-text">
            {selectedItems.length} item(s) selecionado(s)
          </span>
          <button
            onClick={() => onBulkDelete(selectedItems)}
            className="min-h-11 rounded-syncar-control bg-syncar-danger px-4 py-2 font-semibold text-white transition-colors hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus"
          >
            Excluir
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-syncar-border">
        <thead className="bg-syncar-surface-subtle">
          <tr>
            <th className="px-6 py-3">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Selecionar todos os itens"
                  className="rounded border-syncar-border text-syncar-brand accent-syncar-brand focus:ring-syncar-focus"
                />
              </div>
            </th>
            {columns.map((col) => (
              <th
                key={String(col.header)}
                className={`px-6 py-3 text-left text-xs font-semibold text-syncar-muted ${col.sortable ? "cursor-pointer select-none hover:text-syncar-text" : ""}`}
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
            <th className="px-6 py-3 text-right text-xs font-semibold text-syncar-muted">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-syncar-border bg-syncar-surface">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item.id)}
              className={`cursor-pointer transition-colors hover:bg-syncar-surface-subtle ${selectedItems.includes(item.id) ? "bg-syncar-surface-subtle" : ""}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Selecionar item ${item.id}`}
                    className="rounded border-syncar-border text-syncar-brand accent-syncar-brand focus:ring-syncar-focus"
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
                  aria-label="Editar item"
                  onClick={() => onEdit(item)}
                  className="mr-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-syncar-control text-syncar-brand hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus"
                >
                  <Edit size={18} />
                </button>
                <button
                  title="Excluir"
                  aria-label="Excluir item"
                  onClick={() => onDelete(item)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-syncar-control text-syncar-danger hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-syncar-focus"
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
