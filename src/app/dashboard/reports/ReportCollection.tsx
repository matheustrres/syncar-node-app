"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import styles from "./reports.module.css";

export const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

interface Props<T> {
  items: T[];
  label: string;
  searchText: (item: T) => string;
  sorts: { label: string; compare: (a: T, b: T) => number }[];
  children: (items: T[]) => ReactNode;
}

export default function ReportCollection<T>({ items, label, searchText, sorts, children }: Props<T>) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(0);
  const [size, setSize] = useState(5);
  const [page, setPage] = useState(1);
  const filtered = items.filter(item => normalizeSearch(searchText(item)).includes(normalizeSearch(query.trim()))).sort(sorts[sort].compare);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  if (page !== current) setPage(current);
  const start = (current - 1) * size;
  return <div className={styles.collection}>
    <div className={styles.collectionToolbar}>
      <label className={styles.searchLabel} htmlFor={`${id}-search`}>Buscar {label}<span className={styles.searchField}><Search size={17} aria-hidden="true" /><input id={`${id}-search`} type="search" placeholder="Nome, placa ou modelo" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></span></label>
      <label className={styles.pageSizeLabel}>Ordenar por<select value={sort} onChange={event => { setSort(Number(event.target.value)); setPage(1); }}>{sorts.map((option, index) => <option key={option.label} value={index}>{option.label}</option>)}</select></label>
      <label className={styles.pageSizeLabel}>Por página<select value={size} onChange={event => { setSize(Number(event.target.value)); setPage(1); }}>{[5, 10, 25].map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    {filtered.length ? children(filtered.slice(start, start + size)) : <div className={styles.searchEmpty}><strong>Nenhum resultado encontrado.</strong><p>{query ? "Tente outro nome, placa ou modelo." : "Os registros aparecerão aqui quando houver dados."}</p>{query && <button className={styles.textAction} onClick={() => { setQuery(""); setPage(1); }}>Limpar busca</button>}</div>}
    <footer className={styles.listFooter}><p role="status">{filtered.length ? `${start + 1}–${Math.min(start + size, filtered.length)} de ${filtered.length}` : "0"} {label}</p><nav className={styles.pagination} aria-label={`Paginação de ${label}`}><button disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={16} />Anterior</button><span>Página {current} de {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)}>Próxima<ChevronRight size={16} /></button></nav></footer>
  </div>;
}
