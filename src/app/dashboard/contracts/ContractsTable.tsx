"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { ContractWithRelations } from "@/hooks/useData";
import ContractStatus from "./ContractStatus";
import styles from "../listing.module.css";
import contractStyles from "./contracts.module.css";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const contractDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const sortableColumns = [
  { key: "driver.name", label: "Motorista" },
  { key: "vehicle.plate", label: "Veículo" },
  { key: "startDate", label: "Data de início" },
  { key: "weeklyValue", label: "Valor semanal" },
  { key: "duration", label: "Duração" },
  { key: "status", label: "Status" },
];

interface Props {
  contracts: ContractWithRelations[];
  onOpen: (id: string) => void;
  onEdit: (contract: ContractWithRelations) => void;
  onDelete: (contract: ContractWithRelations) => void;
  onBulkDelete: (ids: string[]) => void;
  onSort: (column: string, direction: "asc" | "desc") => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

export default function ContractsTable({ contracts, onOpen, onEdit, onDelete, onBulkDelete, onSort, sortColumn, sortDirection }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleSelected = selectedIds.filter((id) => contracts.some((contract) => contract.id === id));
  const allSelected = contracts.length > 0 && visibleSelected.length === contracts.length;
  const toggleOne = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const sort = (key: string) => onSort(key, sortColumn === key && sortDirection === "asc" ? "desc" : "asc");

  return (
    <>
      {visibleSelected.length > 0 && <div className={styles.selectionBar}><span>{visibleSelected.length} {visibleSelected.length === 1 ? "contrato selecionado" : "contratos selecionados"}</span><button type="button" onClick={() => onBulkDelete(visibleSelected)}><Trash2 size={17} aria-hidden="true" /> Excluir selecionados</button></div>}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead><tr>
            <th scope="col" className={styles.checkboxCell}><input type="checkbox" aria-label="Selecionar todos os contratos desta página" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : contracts.map((contract) => contract.id))} /></th>
            {sortableColumns.map(({ key, label }) => <th scope="col" key={key} aria-sort={sortColumn === key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}><button type="button" className={styles.sortButton} onClick={() => sort(key)}>{label}{sortColumn === key && (sortDirection === "asc" ? <ArrowUp size={15} aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />)}</button></th>)}
            <th scope="col" className={styles.actionHeading}>Ações</th>
          </tr></thead>
          <tbody>{contracts.map((contract) => <tr key={contract.id}>
            <td className={styles.checkboxCell}><input type="checkbox" aria-label={`Selecionar contrato de ${contract.driver.name}`} checked={visibleSelected.includes(contract.id)} onChange={() => toggleOne(contract.id)} /></td>
            <td><button type="button" className={styles.plateLink} onClick={() => onOpen(contract.id)}>{contract.driver.name}</button></td>
            <td>{contract.vehicle.plate}<span className={contractStyles.vehicleModel}>{contract.vehicle.model}</span></td>
            <td>{contractDate.format(new Date(contract.startDate))}</td>
            <td className={contractStyles.value}>{currency.format(contract.weeklyValue)}</td>
            <td>{contract.duration ? `${contract.duration} semanas` : "Indeterminada"}</td>
            <td><ContractStatus status={contract.status} /></td>
            <td className={styles.rowActions}><button type="button" aria-label={`Editar contrato de ${contract.driver.name}`} title="Editar contrato" onClick={() => onEdit(contract)}><Edit2 size={17} aria-hidden="true" /></button><button type="button" aria-label={`Excluir contrato de ${contract.driver.name}`} title="Excluir contrato" onClick={() => onDelete(contract)}><Trash2 size={17} aria-hidden="true" /></button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
