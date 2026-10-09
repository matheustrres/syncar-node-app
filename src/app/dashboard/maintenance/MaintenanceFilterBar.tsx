"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./maintenance.module.css";

export interface MaintenanceFilterDraft {
  vehicle: string;
  type: string;
  costMin: string;
  costMax: string;
  dateStartDate: string;
  dateEndDate: string;
  mileageMin: string;
  mileageMax: string;
}

export const emptyMaintenanceFilters: MaintenanceFilterDraft = {
  vehicle: "", type: "", costMin: "", costMax: "",
  dateStartDate: "", dateEndDate: "", mileageMin: "", mileageMax: "",
};

interface Props {
  value: MaintenanceFilterDraft;
  onChange: (value: MaintenanceFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
  summary: { total: number; preventive: number; corrective: number; oil: number; tires: number; brakes: number; other: number };
}

const ranges = [
  { minLabel: "Custo mínimo", maxLabel: "Custo máximo", label: "Custo (R$)", min: "costMin", max: "costMax", type: "number" },
  { minLabel: "Data inicial", maxLabel: "Data final", label: "Período", min: "dateStartDate", max: "dateEndDate", type: "date" },
  { minLabel: "Quilometragem mínima", maxLabel: "Quilometragem máxima", label: "Quilometragem (km)", min: "mileageMin", max: "mileageMax", type: "number" },
] as const;

export default function MaintenanceFilterBar({ value, onChange, onClear, activeCount, summary }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const set = (key: keyof MaintenanceFilterDraft, next: string) => onChange({ ...value, [key]: next });
  const advancedCount = ranges.filter(({ min, max }) => value[min] || value[max]).length;
  const types = [
    { value: "PREVENTIVA", label: "Preventiva", count: summary.preventive },
    { value: "CORRETIVA", label: "Corretiva", count: summary.corrective },
    { value: "TROCA_OLEO", label: "Troca de óleo", count: summary.oil },
    { value: "PNEUS", label: "Pneus", count: summary.tires },
    { value: "FREIOS", label: "Freios", count: summary.brakes },
    { value: "OUTROS", label: "Outros", count: summary.other },
  ];
  const display = (text: string, type: string) => type === "date" ? text.split("-").reverse().join("/") : Number(text).toLocaleString("pt-BR");
  return (
    <div className={styles.filters}>
      <div className={styles.filterControls}>
        <label className={styles.searchField}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Buscar placa ou modelo</span><input value={value.vehicle} onChange={(event) => set("vehicle", event.target.value)} placeholder="Buscar placa ou modelo" /></label>
        <label className={styles.typeSelect}>
          <span className={styles.srOnly}>Tipo de serviço — contagens do histórico completo</span>
          <select value={value.type} onChange={(event) => set("type", event.target.value)}>
            <option value="">Tipo de serviço: Todos ({summary.total})</option>
            {types.map((type) => <option key={type.value} value={type.value}>{type.label} ({type.count})</option>)}
          </select>
        </label>
        <button type="button" className={styles.moreFilters} aria-haspopup="dialog" onClick={() => { setDraft(value); setAdvancedOpen(true); }}><SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros{advancedCount > 0 ? ` · ${advancedCount}` : ""}</button>
      </div>
      {activeCount > 0 && <div className={styles.activeFilters} aria-label="Filtros ativos">
        {value.vehicle && <button type="button" onClick={() => set("vehicle", "")} aria-label="Remover busca por veículo">Busca: {value.vehicle}<X size={14} aria-hidden="true" /></button>}
        {value.type && <button type="button" onClick={() => set("type", "")} aria-label="Remover filtro de tipo">{types.find((type) => type.value === value.type)?.label}<X size={14} aria-hidden="true" /></button>}
        {ranges.filter(({ min, max }) => value[min] || value[max]).map(({ label, min, max, type }) => <button key={min} type="button" aria-label={`Remover filtro de ${label}`} onClick={() => onChange({ ...value, [min]: "", [max]: "" })}>
          {label}: {value[min] ? `de ${display(value[min], type)}` : ""} {value[max] ? `até ${display(value[max], type)}` : ""}<X size={14} aria-hidden="true" />
        </button>)}
        <button type="button" className={styles.clearButton} onClick={onClear}>Limpar filtros</button>
      </div>}
      <Modal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} title="Filtrar manutenções" size="xl" variant="platform">
        <p className={styles.filterDescription}>Refine o histórico por custo, período e quilometragem.</p>
            <form className={styles.filterForm} onSubmit={(event) => {
              event.preventDefault();
              const next = { ...value };
              ranges.forEach(({ min, max }) => { next[min] = draft[min]; next[max] = draft[max]; });
              onChange(next);
              setAdvancedOpen(false);
            }}>
              <div className={styles.filterGrid}>
                {ranges.map(({ label, min, max, type, minLabel, maxLabel }) => <fieldset key={min} className={styles.rangeField}>
                  <legend>{label}</legend>
                  <div className={styles.rangeInputs}>
                    <label><span>{minLabel}</span><input type={type} step={min === "costMin" ? "0.01" : undefined} min={type === "number" ? "0" : undefined} aria-label={minLabel} value={draft[min]} onChange={(event) => setDraft({ ...draft, [min]: event.target.value })} /></label>
                    <label><span>{maxLabel}</span><input type={type} step={max === "costMax" ? "0.01" : undefined} min={draft[min] || (type === "number" ? "0" : undefined)} aria-label={maxLabel} value={draft[max]} onChange={(event) => setDraft({ ...draft, [max]: event.target.value })} /></label>
                  </div>
                </fieldset>)}
              </div>
              <div className={styles.filterFooter}>
                <button type="button" className={styles.clearButton} onClick={() => setDraft({ ...emptyMaintenanceFilters })}>Limpar filtros</button>
                <button type="submit" className={styles.applyButton}>Aplicar filtros</button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
