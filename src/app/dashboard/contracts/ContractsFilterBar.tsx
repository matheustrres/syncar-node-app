"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "../vehicles/vehicles.module.css";

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

export default function ContractsFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const set = (key: keyof ContractFilterDraft, next: string) => onChange({ ...value, [key]: next });
  return (
    <section className={styles.filters} aria-labelledby="contract-filters-title">
      <div className={styles.filterHeader}>
        <div className={styles.filterHeading}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          <h2 id="contract-filters-title">Filtrar contratos</h2>
          {activeCount > 0 && <span className={styles.filterCount}>{activeCount} ativos</span>}
        </div>
        {activeCount > 0 && <button type="button" className={styles.clearButton} onClick={onClear}><X size={16} aria-hidden="true" /> Limpar filtros</button>}
      </div>
      <div className={styles.filterGrid}>
        <label className={styles.field}><span>Motorista</span><div className={styles.inputWithIcon}><Search size={17} aria-hidden="true" /><input value={value.driverName} onChange={(event) => set("driverName", event.target.value)} placeholder="Buscar nome" /></div></label>
        <label className={styles.field}><span>Placa</span><input value={value.vehiclePlate} onChange={(event) => set("vehiclePlate", event.target.value)} placeholder="Ex.: ABC1234" /></label>
        <label className={styles.field}><span>Modelo</span><input value={value.vehicleModel} onChange={(event) => set("vehicleModel", event.target.value)} placeholder="Ex.: Corolla" /></label>
        <label className={styles.field}><span>Status</span><select value={value.status} onChange={(event) => set("status", event.target.value)}><option value="">Todos os status</option><option value="Ativo">Ativo</option><option value="Encerrado">Encerrado</option></select></label>
        <fieldset className={styles.rangeField}><legend>Valor semanal</legend><div className={styles.rangeInputs}><input type="number" min="0" inputMode="decimal" aria-label="Valor semanal mínimo" placeholder="De" value={value.weeklyValueMin} onChange={(event) => set("weeklyValueMin", event.target.value)} /><span aria-hidden="true">–</span><input type="number" min="0" inputMode="decimal" aria-label="Valor semanal máximo" placeholder="Até" value={value.weeklyValueMax} onChange={(event) => set("weeklyValueMax", event.target.value)} /></div></fieldset>
        <fieldset className={styles.rangeField}><legend>Data de início</legend><div className={styles.rangeInputs}><input type="date" aria-label="Data de início inicial" value={value.startDateStartDate} onChange={(event) => set("startDateStartDate", event.target.value)} /><span aria-hidden="true">–</span><input type="date" aria-label="Data de início final" value={value.startDateEndDate} onChange={(event) => set("startDateEndDate", event.target.value)} /></div></fieldset>
      </div>
    </section>
  );
}
