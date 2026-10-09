"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { MaintenanceWithRelations } from "@/hooks/useData";
import styles from "../listing.module.css";
import local from "./maintenance.module.css";

export const maintenanceTypeLabels: Record<string, string> = {
  PREVENTIVA: "Preventiva", CORRETIVA: "Corretiva", TROCA_OLEO: "Troca de óleo",
  PNEUS: "Pneus", FREIOS: "Freios", OUTROS: "Outros",
};
export const formatCost = (cost: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cost);
export const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
export const formatMileage = (mileage: number) => `${new Intl.NumberFormat("pt-BR").format(mileage)} km`;

interface Props {
  maintenance: MaintenanceWithRelations[];
  onEdit: (item: MaintenanceWithRelations) => void;
  onDelete: (item: MaintenanceWithRelations) => void;
  onBulkDelete: (ids: string[]) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

const columns = [
  { key: "vehicle.plate", label: "Veículo" },
  { key: "type", label: "Tipo" },
  { key: "description", label: "Descrição" },
  { key: "date", label: "Data" },
  { key: "mileage", label: "Quilometragem" },
  { key: "cost", label: "Custo" },
];

export default function MaintenanceTable({ maintenance, onEdit, onDelete, onBulkDelete, onSort, sortColumn, sortDirection }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = selectedIds.filter((id) => maintenance.some((item) => item.id === id));
  const allSelected = maintenance.length > 0 && selected.length === maintenance.length;
  const toggleOne = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const sort = (key: string) => onSort(key, sortColumn === key && sortDirection === "asc" ? "desc" : "asc");

  return (
    <>
      {selected.length > 0 && <div className={styles.selectionBar}><span>{selected.length} {selected.length === 1 ? "manutenção selecionada" : "manutenções selecionadas"}</span><button type="button" onClick={() => onBulkDelete(selected)}><Trash2 size={17} aria-hidden="true" /> Excluir selecionadas</button></div>}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead><tr>
            <th scope="col" className={styles.checkboxCell}><input type="checkbox" aria-label="Selecionar todas as manutenções desta página" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : maintenance.map((item) => item.id))} /></th>
            {columns.map(({ key, label }) => <th scope="col" key={key} aria-sort={sortColumn === key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}><button type="button" className={styles.sortButton} onClick={() => sort(key)}>{label}{sortColumn === key && (sortDirection === "asc" ? <ArrowUp size={15} aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />)}</button></th>)}
            <th scope="col" className={styles.actionHeading}>Ações</th>
          </tr></thead>
          <tbody>{maintenance.map((item) => <tr key={item.id}>
            <td className={styles.checkboxCell}><input type="checkbox" aria-label={`Selecionar manutenção do veículo ${item.vehicle.plate}`} checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)} /></td>
            <td><span className={local.vehiclePlate}>{item.vehicle.plate}</span><span className={local.vehicleModel}>{item.vehicle.model}</span></td>
            <td><span className={local.typeBadge}>{maintenanceTypeLabels[item.type] || item.type}</span></td>
            <td className={local.descriptionCell} title={item.description || "Não informada"}>{item.description || "Não informada"}</td>
            <td>{formatDate(item.date)}</td>
            <td>{formatMileage(item.mileage)}</td>
            <td className={local.costCell}>{formatCost(item.cost)}</td>
            <td className={styles.rowActions}><button type="button" aria-label={`Editar manutenção do veículo ${item.vehicle.plate}`} title="Editar manutenção" onClick={() => onEdit(item)}><Edit2 size={17} aria-hidden="true" /></button><button type="button" aria-label={`Excluir manutenção do veículo ${item.vehicle.plate}`} title="Excluir manutenção" onClick={() => onDelete(item)}><Trash2 size={17} aria-hidden="true" /></button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
