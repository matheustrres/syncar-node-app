"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "../vehicles/vehicles.module.css";

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
}

export default function MaintenanceFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const set = (key: keyof MaintenanceFilterDraft, next: string) => onChange({ ...value, [key]: next });
  return (
    <section className={styles.filters} aria-labelledby="maintenance-filters-title">
      <div className={styles.filterHeader}>
        <div className={styles.filterHeading}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          <h2 id="maintenance-filters-title">Filtrar manutenções</h2>
          {activeCount > 0 && <span className={styles.filterCount}>{activeCount} ativos</span>}
        </div>
        {activeCount > 0 && <button type="button" className={styles.clearButton} onClick={onClear}><X size={16} aria-hidden="true" /> Limpar filtros</button>}
      </div>
      <div className={styles.filterGrid}>
        <label className={styles.field}><span>Veículo</span><div className={styles.inputWithIcon}><Search size={17} aria-hidden="true" /><input value={value.vehicle} onChange={(event) => set("vehicle", event.target.value)} placeholder="Buscar placa ou modelo" /></div></label>
        <label className={styles.field}><span>Tipo</span><select value={value.type} onChange={(event) => set("type", event.target.value)}><option value="">Todos os tipos</option><option value="PREVENTIVA">Preventiva</option><option value="CORRETIVA">Corretiva</option><option value="TROCA_OLEO">Troca de óleo</option><option value="PNEUS">Pneus</option><option value="FREIOS">Freios</option><option value="OUTROS">Outros</option></select></label>
        <fieldset className={styles.rangeField}><legend>Custo</legend><div className={styles.rangeInputs}><input type="number" min="0" inputMode="decimal" aria-label="Custo mínimo" placeholder="De" value={value.costMin} onChange={(event) => set("costMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" min="0" inputMode="decimal" aria-label="Custo máximo" placeholder="Até" value={value.costMax} onChange={(event) => set("costMax", event.target.value)} /></div></fieldset>
        <fieldset className={styles.rangeField}><legend>Data</legend><div className={styles.rangeInputs}><input type="date" aria-label="Data inicial" value={value.dateStartDate} onChange={(event) => set("dateStartDate", event.target.value)} /><span aria-hidden="true">–</span><input type="date" aria-label="Data final" value={value.dateEndDate} onChange={(event) => set("dateEndDate", event.target.value)} /></div></fieldset>
        <fieldset className={styles.rangeField}><legend>Quilometragem</legend><div className={styles.rangeInputs}><input type="number" min="0" inputMode="numeric" aria-label="Quilometragem mínima" placeholder="De" value={value.mileageMin} onChange={(event) => set("mileageMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" min="0" inputMode="numeric" aria-label="Quilometragem máxima" placeholder="Até" value={value.mileageMax} onChange={(event) => set("mileageMax", event.target.value)} /></div></fieldset>
      </div>
    </section>
  );
}
