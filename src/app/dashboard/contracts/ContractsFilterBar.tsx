"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import styles from "./contracts.module.css";

export interface ContractFilterDraft {
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: string;
  weeklyValueMin: string;
  weeklyValueMax: string;
  startDateStartDate: string;
  startDateEndDate: string;
}

export const emptyContractFilters: ContractFilterDraft = {
  driverName: "", vehiclePlate: "", vehicleModel: "", status: "",
  weeklyValueMin: "", weeklyValueMax: "", startDateStartDate: "", startDateEndDate: "",
};

interface Props {
  value: ContractFilterDraft;
  onChange: (value: ContractFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
}

const additionalFilters = [
  { key: "vehiclePlate", label: "Placa" }, { key: "vehicleModel", label: "Modelo" },
  { key: "weeklyValueMin", label: "Valor semanal mínimo" }, { key: "weeklyValueMax", label: "Valor semanal máximo" },
  { key: "startDateStartDate", label: "Início de" }, { key: "startDateEndDate", label: "Início até" },
] as const;

export default function ContractsFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const setDraftField = (key: keyof ContractFilterDraft, next: string) => setDraft((current) => ({ ...current, [key]: next }));
  const set = (key: keyof ContractFilterDraft, next: string) => onChange({ ...value, [key]: next });
  const advancedCount = [value.vehiclePlate, value.vehicleModel, value.weeklyValueMin, value.weeklyValueMax, value.startDateStartDate, value.startDateEndDate].filter(Boolean).length;

  return (
    <div className={styles.filters}>
      <div className={styles.filterControls}>
        <label className={styles.searchField}>
          <Search size={17} aria-hidden="true" />
          <span className={styles.srOnly}>Buscar contrato pelo nome do motorista</span>
          <input value={value.driverName} onChange={(event) => set("driverName", event.target.value)} placeholder="Buscar motorista" />
        </label>
        <label className={styles.statusSelect}>
          <span className={styles.srOnly}>Filtrar por situação do contrato</span>
          <select value={value.status} onChange={(event) => set("status", event.target.value)}>
            <option value="">Situação: Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Encerrado">Encerrados</option>
          </select>
        </label>
        <button type="button" className={styles.moreFilters} aria-haspopup="dialog" onClick={() => { setDraft(value); setAdvancedOpen(true); }}><SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros{advancedCount > 0 ? ` (${advancedCount})` : ""}</button>
        {activeCount > 0 && <button type="button" className={styles.clearButton} onClick={onClear}><X size={16} aria-hidden="true" /> Limpar</button>}
      </div>
      {advancedCount > 0 && <div className={styles.activeFilters}>
        {additionalFilters.filter(({ key }) => value[key]).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => set(key, "")} aria-label={`Remover filtro ${label}`}>{label}: {key.startsWith("startDate") ? value[key].split("-").reverse().join("/") : value[key]}<X size={14} aria-hidden="true" /></button>
        ))}
      </div>}
      <Modal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} title="Filtrar contratos" size="xl" variant="platform">
        <p className={styles.filterDescription}>Refine a lista por veículo, valor semanal e data de início.</p>
        <form className={styles.filterForm} onSubmit={(event) => {
          event.preventDefault();
          onChange({ ...draft, driverName: value.driverName, status: value.status });
          setAdvancedOpen(false);
        }}>
          <div className={styles.filterGrid}>
            <label className={styles.field}><span>Placa</span><input value={draft.vehiclePlate} onChange={(event) => setDraftField("vehiclePlate", event.target.value)} placeholder="Ex.: ABC1234" /></label>
            <label className={styles.field}><span>Modelo</span><input value={draft.vehicleModel} onChange={(event) => setDraftField("vehicleModel", event.target.value)} placeholder="Ex.: Corolla" /></label>
            <fieldset className={styles.rangeField}><legend>Valor semanal</legend><div className={styles.rangeInputs}><input type="number" min="0" step="0.01" inputMode="decimal" aria-label="Valor semanal mínimo" placeholder="De" value={draft.weeklyValueMin} onChange={(event) => setDraftField("weeklyValueMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" min={draft.weeklyValueMin || "0"} step="0.01" inputMode="decimal" aria-label="Valor semanal máximo" placeholder="Até" value={draft.weeklyValueMax} onChange={(event) => setDraftField("weeklyValueMax", event.target.value)} /></div></fieldset>
            <fieldset className={styles.rangeField}><legend>Data de início</legend><div className={styles.rangeInputs}><input type="date" aria-label="Data de início inicial" value={draft.startDateStartDate} onChange={(event) => setDraftField("startDateStartDate", event.target.value)} /><span aria-hidden="true">–</span><input type="date" min={draft.startDateStartDate || undefined} aria-label="Data de início final" value={draft.startDateEndDate} onChange={(event) => setDraftField("startDateEndDate", event.target.value)} /></div></fieldset>
          </div>
          <div className={styles.filterFooter}>
            <button type="button" className={styles.clearButton} onClick={() => setDraft({ ...emptyContractFilters })}>Limpar filtros</button>
            <button type="submit" className={styles.applyFilters}>Aplicar filtros</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
