"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./vehicles.module.css";

export interface VehicleFilterDraft {
  plate: string;
  brand: string;
  model: string;
  status: string;
  yearMin: string;
  yearMax: string;
  kmMin: string;
  kmMax: string;
}

export const emptyVehicleFilters: VehicleFilterDraft = {
  plate: "",
  brand: "",
  model: "",
  status: "",
  yearMin: "",
  yearMax: "",
  kmMin: "",
  kmMax: "",
};

interface Props {
  value: VehicleFilterDraft;
  onChange: (value: VehicleFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
}

export default function VehiclesFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const set = (key: keyof VehicleFilterDraft, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <section className={styles.filters} aria-labelledby="vehicle-filters-title">
      <div className={styles.filterHeader}>
        <div className={styles.filterHeading}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          <h2 id="vehicle-filters-title">Filtrar veículos</h2>
          {activeCount > 0 && <span className={styles.filterCount}>{activeCount} ativos</span>}
        </div>
        {activeCount > 0 && (
          <button type="button" className={styles.clearButton} onClick={onClear}>
            <X size={16} aria-hidden="true" /> Limpar filtros
          </button>
        )}
      </div>
      <div className={styles.filterGrid}>
        <label className={styles.field}>
          <span>Placa</span>
          <div className={styles.inputWithIcon}>
            <Search size={17} aria-hidden="true" />
            <input value={value.plate} onChange={(event) => set("plate", event.target.value)} placeholder="Buscar placa" />
          </div>
        </label>
        <label className={styles.field}>
          <span>Marca</span>
          <input value={value.brand} onChange={(event) => set("brand", event.target.value)} placeholder="Ex.: Toyota" />
        </label>
        <label className={styles.field}>
          <span>Modelo</span>
          <input value={value.model} onChange={(event) => set("model", event.target.value)} placeholder="Ex.: Corolla" />
        </label>
        <label className={styles.field}>
          <span>Status</span>
          <select value={value.status} onChange={(event) => set("status", event.target.value)}>
            <option value="">Todos os status</option>
            <option value="Disponível">Disponível</option>
            <option value="Alugado">Alugado</option>
            <option value="Manutenção">Manutenção</option>
          </select>
        </label>
        <fieldset className={styles.rangeField}>
          <legend>Ano</legend>
          <div className={styles.rangeInputs}>
            <input type="number" inputMode="numeric" min="1900" aria-label="Ano mínimo" placeholder="De" value={value.yearMin} onChange={(event) => set("yearMin", event.target.value)} />
            <span aria-hidden="true">–</span>
            <input type="number" inputMode="numeric" min="1900" aria-label="Ano máximo" placeholder="Até" value={value.yearMax} onChange={(event) => set("yearMax", event.target.value)} />
          </div>
        </fieldset>
        <fieldset className={styles.rangeField}>
          <legend>Quilometragem</legend>
          <div className={styles.rangeInputs}>
            <input type="number" inputMode="numeric" min="0" aria-label="Quilometragem mínima" placeholder="De" value={value.kmMin} onChange={(event) => set("kmMin", event.target.value)} />
            <span aria-hidden="true">–</span>
            <input type="number" inputMode="numeric" min="0" aria-label="Quilometragem máxima" placeholder="Até" value={value.kmMax} onChange={(event) => set("kmMax", event.target.value)} />
          </div>
        </fieldset>
      </div>
    </section>
  );
}
