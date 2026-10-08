"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { Driver } from "@/types";
import DriverStatus from "./DriverStatus";
import styles from "../vehicles/vehicles.module.css";

interface Props {
  drivers: Driver[];
  onOpen: (id: string) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onBulkDelete: (ids: string[]) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

const sortableColumns = [
  { key: "name", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "phone", label: "Telefone" },
  { key: "status", label: "Status" },
];

export default function DriversTable({ drivers, onOpen, onEdit, onDelete, onBulkDelete, onSort, sortColumn, sortDirection }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleSelected = selectedIds.filter((id) => drivers.some((driver) => driver.id === id));
  const allSelected = drivers.length > 0 && visibleSelected.length === drivers.length;

  const toggleOne = (id: string) =>
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const sort = (key: string) =>
    onSort(key, sortColumn === key && sortDirection === "asc" ? "desc" : "asc");

  return (
    <div className={styles.tablePanel}>
      {visibleSelected.length > 0 && (
        <div className={styles.selectionBar}>
          <span>{visibleSelected.length} {visibleSelected.length === 1 ? "motorista selecionado" : "motoristas selecionados"}</span>
          <button type="button" onClick={() => onBulkDelete(visibleSelected)}>
            <Trash2 size={17} aria-hidden="true" /> Excluir selecionados
          </button>
        </div>
      )}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.checkboxCell}>
                <input type="checkbox" aria-label="Selecionar todos os motoristas desta página" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : drivers.map((driver) => driver.id))} />
              </th>
              {sortableColumns.map(({ key, label }) => (
                <th scope="col" key={key} aria-sort={sortColumn === key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
                  <button type="button" className={styles.sortButton} onClick={() => sort(key)}>
                    {label}
                    {sortColumn === key && (sortDirection === "asc" ? <ArrowUp size={15} aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />)}
                  </button>
                </th>
              ))}
              <th scope="col" className={styles.actionHeading}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className={styles.checkboxCell}>
                  <input type="checkbox" aria-label={`Selecionar motorista ${driver.name}`} checked={visibleSelected.includes(driver.id)} onChange={() => toggleOne(driver.id)} />
                </td>
                <td><button type="button" className={styles.plateLink} onClick={() => onOpen(driver.id)}>{driver.name}</button></td>
                <td>{driver.cpf}</td>
                <td>{driver.phone}</td>
                <td><DriverStatus status={driver.status} /></td>
                <td className={styles.rowActions}>
                  <button type="button" aria-label={`Editar motorista ${driver.name}`} title="Editar motorista" onClick={() => onEdit(driver)}><Edit2 size={17} aria-hidden="true" /></button>
                  <button type="button" aria-label={`Excluir motorista ${driver.name}`} title="Excluir motorista" onClick={() => onDelete(driver)}><Trash2 size={17} aria-hidden="true" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
