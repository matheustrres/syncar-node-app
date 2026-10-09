"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import styles from "./vehicles.module.css";

export interface VehicleFilterDraft {
  search: string; plate: string; brand: string; model: string; status: string;
  yearMin: string; yearMax: string; kmMin: string; kmMax: string;
}

export const emptyVehicleFilters: VehicleFilterDraft = {
  search: "", plate: "", brand: "", model: "", status: "",
  yearMin: "", yearMax: "", kmMin: "", kmMax: "",
};

interface Props {
  value: VehicleFilterDraft;
  onChange: (value: VehicleFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
}

const filterLabels: Record<keyof VehicleFilterDraft, string> = {
  search: "Busca", plate: "Placa", brand: "Marca", model: "Modelo", status: "Situação",
  yearMin: "Ano mínimo", yearMax: "Ano máximo", kmMin: "Km mínimo", kmMax: "Km máximo",
};

const statuses = [
  { label: "Todos", value: "" }, { label: "Disponíveis", value: "Disponível" },
  { label: "Alugados", value: "Alugado" }, { label: "Manutenção", value: "Manutenção" },
  { label: "Indisponíveis", value: "Indisponível" },
];

export default function VehiclesFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const setDraftField = (key: keyof VehicleFilterDraft, next: string) => setDraft((current) => ({ ...current, [key]: next }));
  const set = (key: keyof VehicleFilterDraft, next: string) => onChange({ ...value, [key]: next });
  const advancedCount = [value.plate, value.brand, value.model, value.yearMin, value.yearMax, value.kmMin, value.kmMax].filter(Boolean).length;

  return (
    <div className={styles.filters}>
      <div className={styles.filterControls}>
        <label className={styles.searchField}>
          <Search size={17} aria-hidden="true" />
          <span className={styles.srOnly}>Buscar placa, marca ou modelo</span>
          <input value={value.search} onChange={(event) => set("search", event.target.value)} placeholder="Buscar placa, marca ou modelo" />
        </label>
        <label className={styles.statusSelect}>
          <span className={styles.srOnly}>Filtrar por situação do veículo</span>
          <select value={value.status} onChange={(event) => set("status", event.target.value)}>
            {statuses.map((status) => <option key={status.label} value={status.value}>{status.value ? status.label : "Situação: Todos"}</option>)}
          </select>
        </label>
        <button type="button" className={styles.moreFilters} aria-haspopup="dialog" onClick={() => { setDraft(value); setAdvancedOpen(true); }}><SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros{advancedCount > 0 ? ` (${advancedCount})` : ""}</button>
      </div>
      {activeCount > 0 && <div className={styles.activeFilters}>
        {Object.entries(value).filter(([, text]) => text).map(([key, text]) => <button key={key} type="button" onClick={() => set(key as keyof VehicleFilterDraft, "")} aria-label={`Remover filtro ${filterLabels[key as keyof VehicleFilterDraft]}`}>{filterLabels[key as keyof VehicleFilterDraft]}: {text}<X size={14} aria-hidden="true" /></button>)}
        <button type="button" className={styles.clearButton} onClick={onClear}>Limpar filtros</button>
      </div>}
      <Modal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} title="Filtrar veículos" size="xl" variant="platform">
        <p className={styles.filterDescription}>Refine a frota por identificação, ano e quilometragem.</p>
        <form className={styles.filterForm} onSubmit={(event) => {
          event.preventDefault();
          onChange({ ...draft, search: value.search, status: value.status });
          setAdvancedOpen(false);
        }}>
        <div className={styles.filterGrid}>
          <label className={styles.field}><span>Placa</span><input value={draft.plate} onChange={(event) => setDraftField("plate", event.target.value)} placeholder="Buscar placa" /></label>
          <label className={styles.field}><span>Marca</span><input value={draft.brand} onChange={(event) => setDraftField("brand", event.target.value)} placeholder="Ex.: Toyota" /></label>
          <label className={styles.field}><span>Modelo</span><input value={draft.model} onChange={(event) => setDraftField("model", event.target.value)} placeholder="Ex.: Corolla" /></label>
          <fieldset className={styles.rangeField}><legend>Ano</legend><div className={styles.rangeInputs}><input type="number" inputMode="numeric" min="1900" aria-label="Ano mínimo" placeholder="De" value={draft.yearMin} onChange={(event) => setDraftField("yearMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" inputMode="numeric" min={draft.yearMin || "1900"} aria-label="Ano máximo" placeholder="Até" value={draft.yearMax} onChange={(event) => setDraftField("yearMax", event.target.value)} /></div></fieldset>
          <fieldset className={styles.rangeField}><legend>Quilometragem</legend><div className={styles.rangeInputs}><input type="number" inputMode="numeric" min="0" aria-label="Quilometragem mínima" placeholder="De" value={draft.kmMin} onChange={(event) => setDraftField("kmMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" inputMode="numeric" min={draft.kmMin || "0"} aria-label="Quilometragem máxima" placeholder="Até" value={draft.kmMax} onChange={(event) => setDraftField("kmMax", event.target.value)} /></div></fieldset>
        </div>
        <div className={styles.filterFooter}>
          <button type="button" className={styles.clearButton} onClick={() => setDraft({ ...emptyVehicleFilters })}>Limpar filtros</button>
          <button type="submit" className={styles.applyFilters}>Aplicar filtros</button>
        </div>
        </form>
      </Modal>
    </div>
  );
}
