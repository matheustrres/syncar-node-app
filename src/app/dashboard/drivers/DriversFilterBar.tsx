"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "../vehicles/vehicles.module.css";

export interface DriverFilterDraft {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  status: string;
}

export const emptyDriverFilters: DriverFilterDraft = {
  name: "",
  cpf: "",
  phone: "",
  email: "",
  status: "",
};

interface Props {
  value: DriverFilterDraft;
  onChange: (value: DriverFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
}

export default function DriversFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const set = (key: keyof DriverFilterDraft, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <section className={styles.filters} aria-labelledby="driver-filters-title">
      <div className={styles.filterHeader}>
        <div className={styles.filterHeading}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          <h2 id="driver-filters-title">Filtrar motoristas</h2>
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
          <span>Nome</span>
          <div className={styles.inputWithIcon}>
            <Search size={17} aria-hidden="true" />
            <input value={value.name} onChange={(event) => set("name", event.target.value)} placeholder="Buscar nome" />
          </div>
        </label>
        <label className={styles.field}>
          <span>CPF</span>
          <input value={value.cpf} onChange={(event) => set("cpf", event.target.value)} placeholder="Ex.: 000.000.000-00" />
        </label>
        <label className={styles.field}>
          <span>Telefone</span>
          <input value={value.phone} onChange={(event) => set("phone", event.target.value)} placeholder="Ex.: (00) 90000-0000" />
        </label>
        <label className={styles.field}>
          <span>E-mail</span>
          <input type="email" value={value.email} onChange={(event) => set("email", event.target.value)} placeholder="Buscar e-mail" />
        </label>
        <label className={styles.field}>
          <span>Status</span>
          <select value={value.status} onChange={(event) => set("status", event.target.value)}>
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>
      </div>
    </section>
  );
}
