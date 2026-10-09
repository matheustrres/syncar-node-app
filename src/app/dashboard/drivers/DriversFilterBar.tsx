"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import styles from "./drivers.module.css";

export interface DriverFilterDraft {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  status: string;
  missingCnh: string;
}

export const emptyDriverFilters: DriverFilterDraft = {
  name: "",
  cpf: "",
  phone: "",
  email: "",
  status: "",
  missingCnh: "",
};

interface Props {
  value: DriverFilterDraft;
  onChange: (value: DriverFilterDraft) => void;
  onClear: () => void;
  activeCount: number;
}

export default function DriversFilterBar({ value, onChange, onClear, activeCount }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const setDraftField = (key: keyof DriverFilterDraft, next: string) => setDraft((current) => ({ ...current, [key]: next }));
  const set = (key: keyof DriverFilterDraft, next: string) =>
    onChange({ ...value, [key]: next });
  const advancedCount = [value.cpf, value.phone, value.email].filter(Boolean).length;

  return (
    <div className={styles.filters}>
      <div className={styles.filterControls}>
        <label className={styles.searchField}>
          <Search size={17} aria-hidden="true" />
          <span className={styles.srOnly}>Buscar motorista pelo nome</span>
          <input value={value.name} onChange={(event) => set("name", event.target.value)} placeholder="Buscar motorista pelo nome" />
        </label>
        <label className={styles.statusSelect}>
          <span className={styles.srOnly}>Filtrar por situação do motorista</span>
          <select value={value.status} onChange={(event) => set("status", event.target.value)}>
            <option value="">Situação: Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
        </label>
        {value.missingCnh === "true" && <button type="button" className={styles.pendingChip} onClick={() => set("missingCnh", "")} aria-label="Remover filtro sem CNH">Sem CNH <X size={14} aria-hidden="true" /></button>}
        <button type="button" className={styles.moreFilters} aria-haspopup="dialog" onClick={() => { setDraft(value); setAdvancedOpen(true); }}><SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros{advancedCount > 0 ? ` (${advancedCount})` : ""}</button>
        {activeCount > 0 && <button type="button" className={styles.clearButton} onClick={onClear}><X size={16} aria-hidden="true" /> Limpar</button>}
      </div>
      {advancedCount > 0 && <div className={styles.activeFilters}>
        {([{ key: "cpf", label: "CPF" }, { key: "phone", label: "Telefone" }, { key: "email", label: "E-mail" }] as const).filter(({ key }) => value[key]).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => set(key, "")} aria-label={`Remover filtro ${label}`}>{label}: {value[key]}<X size={14} aria-hidden="true" /></button>
        ))}
      </div>}
      <Modal isOpen={advancedOpen} onClose={() => setAdvancedOpen(false)} title="Filtrar motoristas" size="xl" variant="platform">
        <p className={styles.filterDescription}>Refine a lista por CPF, telefone e e-mail.</p>
        <form className={styles.filterForm} onSubmit={(event) => {
          event.preventDefault();
          onChange({ ...value, cpf: draft.cpf, phone: draft.phone, email: draft.email });
          setAdvancedOpen(false);
        }}>
          <div className={styles.filterGrid}>
            <label className={styles.field}><span>CPF</span><input value={draft.cpf} onChange={(event) => setDraftField("cpf", event.target.value)} placeholder="Ex.: 000.000.000-00" /></label>
            <label className={styles.field}><span>Telefone</span><input value={draft.phone} onChange={(event) => setDraftField("phone", event.target.value)} placeholder="Ex.: (00) 90000-0000" /></label>
            <label className={styles.field}><span>E-mail</span><input type="text" inputMode="email" value={draft.email} onChange={(event) => setDraftField("email", event.target.value)} placeholder="Buscar e-mail" /></label>
          </div>
          <div className={styles.filterFooter}>
            <button type="button" className={styles.clearButton} onClick={() => setDraft({ ...emptyDriverFilters })}>Limpar filtros</button>
            <button type="submit" className={styles.applyFilters}>Aplicar filtros</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
