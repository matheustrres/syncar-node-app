"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Wallet } from "lucide-react";
import styles from "./dashboard.module.css";

type Payment = {
  id: string;
  dueDate: string;
  value: number;
  driverName: string;
  vehicleInfo: string;
};
type Filter = "all" | "overdue" | "upcoming";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default function PaymentsPreview({ payments }: { payments: Payment[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const now = new Date();
  const query = search.trim().toLocaleLowerCase("pt-BR");
  const shown = payments.filter((payment) => {
    const overdue = new Date(payment.dueDate) < now;
    return (filter === "all" || (filter === "overdue" ? overdue : !overdue))
      && (!query || `${payment.driverName} ${payment.vehicleInfo}`.toLocaleLowerCase("pt-BR").includes(query));
  });

  return (
    <>
      <div className={styles.paymentControls}>
        <div className={styles.filterTabs} role="group" aria-label="Filtrar cobranças">
          {([["all", "Todas"], ["overdue", "Atrasadas"], ["upcoming", "A vencer"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? styles.activeTab : undefined} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        <label className={styles.paymentSearch}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Buscar cliente ou veículo nas cobranças exibidas</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente ou placa" />
        </label>
      </div>
      {payments.length === 0 ? (
        <div className={styles.emptyState}><Wallet size={24} aria-hidden="true" /><div><strong>Nenhuma cobrança pendente</strong><p>Os pagamentos dos contratos aparecerão aqui quando houver valores a receber.</p><Link href="/dashboard/contracts">Ver contratos <ArrowUpRight size={15} aria-hidden="true" /></Link></div></div>
      ) : shown.length === 0 ? (
        <div className={styles.filterEmpty}>Nenhuma cobrança encontrada nesta amostra. <button type="button" onClick={() => { setFilter("all"); setSearch(""); }}>Limpar filtros</button></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.paymentTable}>
            <thead><tr><th scope="col">Cliente / veículo</th><th scope="col">Vencimento</th><th scope="col">Situação</th><th scope="col">Valor</th></tr></thead>
            <tbody>{shown.map((payment) => {
              const overdue = new Date(payment.dueDate) < now;
              return <tr key={payment.id}>
                <td data-label="Cliente / veículo"><strong>{payment.driverName}</strong><span>{payment.vehicleInfo}</span></td>
                <td data-label="Vencimento">{date.format(new Date(payment.dueDate))}</td>
                <td data-label="Situação"><span className={`${styles.status} ${overdue ? styles.statusOverdue : styles.statusUpcoming}`}>{overdue ? "Atrasada" : "A vencer"}</span></td>
                <td data-label="Valor" className={styles.amount}>{currency.format(payment.value)}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      )}
      <div className={styles.paymentFooter}><span>{shown.length} de {payments.length} {payments.length === 1 ? "lançamento exibido" : "lançamentos exibidos"}</span><span>Até 5 pagamentos pendentes mais antigos</span></div>
    </>
  );
}
