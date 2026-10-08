"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { Vehicle } from "@/types";
import VehicleStatus from "./VehicleStatus";
import styles from "./vehicles.module.css";

interface Props {
  vehicles: Vehicle[];
  onOpen: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onBulkDelete: (ids: string[]) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

const sortableColumns = [
  { key: "plate", label: "Placa" },
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "status", label: "Status" },
];

export default function VehiclesTable({ vehicles, onOpen, onEdit, onDelete, onBulkDelete, onSort, sortColumn, sortDirection }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleSelected = selectedIds.filter((id) => vehicles.some((vehicle) => vehicle.id === id));
  const allSelected = vehicles.length > 0 && visibleSelected.length === vehicles.length;

  const toggleOne = (id: string) =>
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const sort = (key: string) =>
    onSort(key, sortColumn === key && sortDirection === "asc" ? "desc" : "asc");

  return (
    <div className={styles.tablePanel}>
      {visibleSelected.length > 0 && (
        <div className={styles.selectionBar}>
          <span>{visibleSelected.length} {visibleSelected.length === 1 ? "veículo selecionado" : "veículos selecionados"}</span>
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
                <input type="checkbox" aria-label="Selecionar todos os veículos desta página" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : vehicles.map((vehicle) => vehicle.id))} />
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
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className={styles.checkboxCell}>
                  <input type="checkbox" aria-label={`Selecionar veículo ${vehicle.plate}`} checked={visibleSelected.includes(vehicle.id)} onChange={() => toggleOne(vehicle.id)} />
                </td>
                <td><button type="button" className={styles.plateLink} onClick={() => onOpen(vehicle.id)}>{vehicle.plate}</button></td>
                <td>{vehicle.brand}</td>
                <td>{vehicle.model}</td>
                <td><VehicleStatus status={vehicle.status} /></td>
                <td className={styles.rowActions}>
                  <button type="button" aria-label={`Editar veículo ${vehicle.plate}`} title="Editar veículo" onClick={() => onEdit(vehicle)}><Edit2 size={17} aria-hidden="true" /></button>
                  <button type="button" aria-label={`Excluir veículo ${vehicle.plate}`} title="Excluir veículo" onClick={() => onDelete(vehicle)}><Trash2 size={17} aria-hidden="true" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
