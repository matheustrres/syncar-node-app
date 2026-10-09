"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Contract, Driver, Vehicle } from "@/types";
import { ExpenseWithRelations, FinancialPayment } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import PaymentForm from "@/components/forms/PaymentForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton";
import type { FinancialSummary } from "@/lib/financial-summary";
import { expenseLabel } from "@/lib/financial-filters";
import styles from "./financial.module.css";

interface Props {
  initialSummary: FinancialSummary;
  initialPendingPayments: { payments: FinancialPayment[]; total: number };
  initialPaidPayments: { payments: FinancialPayment[]; total: number };
  initialRecentExpenses: { expenses: ExpenseWithRelations[]; total: number };
}

type Tab = "pending" | "paid" | "expenses";
const tabs: { id: Tab; label: string; endpoint: string }[] = [
  { id: "pending", label: "A receber", endpoint: "pending-payments" },
  { id: "paid", label: "Recebimentos", endpoint: "paid-payments" },
  { id: "expenses", label: "Despesas", endpoint: "recent-expenses" },
];
const defaultFilters = { search: "", from: "", to: "", situation: "", category: "", page: 1, limit: 10 };
type Filters = typeof defaultFilters;
interface ListData { payments?: FinancialPayment[]; expenses?: ExpenseWithRelations[]; total: number }

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const date = (value: string | null | undefined) => value ? dateFormat.format(new Date(value)) : "Data não informada";
const fetchOptions = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar os dados.");
  return response.json();
};
function overdue(value: string) {
  const now = new Date();
  return Date.parse(value) < Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}
function Pagination({ page, total, limit: LIMIT, setPage }: { page: number; total: number; limit: number; setPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  return <div className={styles.pagination}><span>{total ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, total)} de {total}</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Próxima</button></div></div>;
}
function PageNavigation({ page, pages, setPage }: { page: number; pages: number; setPage: (page: number) => void }) {
  return <nav className={styles.topPagination} aria-label="Paginação superior">
    <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
    <span>Página {page} de {pages}</span>
    <button type="button" aria-label="Próxima página" disabled={page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
  </nav>;
}
function Empty({ loading, error, text, retry, icon, children }: { loading: boolean; error: unknown; text: string; retry: () => void; icon: React.ReactNode; children?: React.ReactNode }) {
  return <div className={styles.empty}>{loading ? <p role="status">Carregando registros…</p> : error ? <p role="alert">Não foi possível carregar os registros. <button className={styles.textAction} onClick={retry}>Tentar novamente</button></p> : <><span className={styles.emptyVisual} aria-hidden="true">{icon}</span><div className={styles.emptyCopy}><p>{text}</p>{children}</div></>}</div>;
}

export default function FinancialClientPage({ initialPendingPayments, initialPaidPayments, initialRecentExpenses, initialSummary }: Props) {
  const [tab, setTab] = useState<Tab>("pending");
  const [filters, setFilters] = useState<Record<Tab, Filters>>({ pending: { ...defaultFilters }, paid: { ...defaultFilters }, expenses: { ...defaultFilters } });
  const filter = filters[tab];
  const updateFilters = (patch: Partial<Filters>) => setFilters(current => ({ ...current, [tab]: { ...current[tab], ...patch, page: patch.page ?? 1 } }));
  const resetPages = () => setFilters(current => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, { ...value, page: 1 }])) as Record<Tab, Filters>);
  const query = new URLSearchParams(Object.entries(filter).map(([key, value]) => [key, String(value)])).toString();
  const endpoint = tabs.find(item => item.id === tab)!.endpoint;
  const isDefault = Object.entries(defaultFilters).every(([key, value]) => filter[key as keyof Filters] === value);
  const fallbackData = isDefault ? { pending: initialPendingPayments, paid: initialPaidPayments, expenses: initialRecentExpenses }[tab] : undefined;
  const invalidDates = !!filter.from && !!filter.to && filter.from > filter.to;
  const list = useSWR<ListData>(invalidDates ? null : `/api/financial/${endpoint}?${query}`, fetchOptions, { fallbackData });
  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / filter.limit));
  const firstItem = total ? (filter.page - 1) * filter.limit + 1 : 0;
  const lastItem = Math.min(filter.page * filter.limit, total);
  const resultName = tab === "expenses" ? (total === 1 ? "despesa" : "despesas") : tab === "paid" ? (total === 1 ? "recebimento" : "recebimentos") : (total === 1 ? "parcela a receber" : "parcelas a receber");
  const summary = useSWR<FinancialSummary>("/api/financial/summary", fetchOptions, { fallbackData: initialSummary });
  const [detail, setDetail] = useState<FinancialPayment | ExpenseWithRelations | null>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const showDetail = (item: FinancialPayment | ExpenseWithRelations, button: HTMLButtonElement) => { detailTrigger.current = button; setDetail(item); };
  const closeDetail = () => { setDetail(null); detailTrigger.current?.focus(); };
  useEffect(() => { if (detail) drawer.current?.showModal(); else drawer.current?.close(); }, [detail]);
  const shortcut = (target: Tab, patch: Partial<Filters>) => {
    setFilters(current => ({ ...current, [target]: { ...defaultFilters, ...patch } }));
    setTab(target);
  };
  const [modal, setModal] = useState<"payment" | "expense" | null>(null);
  const { data: contracts, error: contractsError, mutate: retryContracts } = useSWR<Contract[]>(modal === "payment" ? "/api/contracts/all" : null, fetchOptions);
  const { data: drivers, error: driversError, mutate: retryDrivers } = useSWR<Driver[]>(modal === "payment" ? "/api/drivers/all" : null, fetchOptions);
  const { data: vehicles, error: vehiclesError, mutate: retryVehicles } = useSWR<Vehicle[]>(modal ? "/api/vehicles/all" : null, fetchOptions);
  const { mutate } = useSWRConfig();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<ExpenseWithRelations | null>(null);
  const [toDelete, setToDelete] = useState<ExpenseWithRelations | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const refresh = () => mutate((key) => typeof key === "string" && key.startsWith("/api/financial/")).catch(() => undefined);
  const close = () => { if (!saving) { setModal(null); setEditing(null); } };
  async function save(path: string, data: object) {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(editing ? `${path}/${editing.id}` : path, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || "Não foi possível salvar o registro."); }
      setModal(null); setEditing(null); resetPages();
      void refresh();
      showToast("Registro salvo com sucesso.", "success");
    } catch (error) { showToast(error instanceof Error ? error.message : "Não foi possível salvar o registro.", "error"); }
    finally { setSaving(false); }
  }
  async function markPaid(id: string) {
    if (paying) return;
    setPaying(id);
    try {
      const response = await fetch(`/api/payments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Pago", paymentDate: new Date().toISOString() }) });
      if (!response.ok) throw new Error();
      resetPages(); void refresh();
      showToast("Recebimento confirmado.", "success");
    } catch { showToast("Não foi possível confirmar o recebimento. Tente novamente.", "error"); }
    finally { setPaying(null); }
  }
  async function deleteExpense() {
    if (!toDelete || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/expenses/${toDelete.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setToDelete(null); resetPages(); void refresh();
      showToast("Despesa excluída com sucesso.", "success");
    } catch { showToast("Não foi possível excluir a despesa. Tente novamente.", "error"); }
    finally { setDeleting(false); }
  }
  return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Operação financeira</span><h1>Financeiro</h1><p>Cobranças, recebimentos e despesas da sua frota.</p></div><div className={styles.headerActions}><button className={styles.secondaryAction} onClick={() => setModal("payment")}><Plus size={18} /> Registrar pagamento</button><button className={styles.primaryAction} onClick={() => setModal("expense")}><Plus size={18} /> Adicionar despesa</button></div></header>
    <section className={styles.summary} aria-label="Resumo financeiro">
      {summary.error ? <p role="alert">Não foi possível carregar o resumo. <button onClick={() => void summary.mutate()}>Tentar novamente</button></p> : !summary.data ? <p role="status">Carregando resumo…</p> : <>
        <button onClick={() => shortcut("pending", { situation: "overdue" })}><span>Em atraso</span><strong className={styles.danger}>{money.format(summary.data.overdue.value)}</strong><small>{summary.data.overdue.count} parcelas em atraso</small></button>
        <button onClick={() => shortcut("pending", { situation: "upcoming" })}><span>A vencer em 7 dias</span><strong>{money.format(summary.data.upcoming.value)}</strong><small>{summary.data.upcoming.count} parcelas · incluindo hoje</small></button>
        <button onClick={() => shortcut("paid", { from: summary.data!.monthStart, to: summary.data!.today })}><span>Recebido no mês</span><strong>{money.format(summary.data.received.value)}</strong><small>{date(summary.data.monthStart)} até {date(summary.data.today)}</small></button>
        <button onClick={() => shortcut("expenses", { from: summary.data!.monthStart, to: summary.data!.today })}><span>Despesas do mês</span><strong>{money.format(summary.data.expenses.value)}</strong><small>{date(summary.data.monthStart)} até {date(summary.data.today)}</small></button>
      </>}
    </section>
    <div className={styles.tabs} role="tablist" aria-label="Operações financeiras">
      {tabs.map((item, index) => <button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="financial-panel" tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); setTab(tabs[next].id); document.getElementById(`tab-${tabs[next].id}`)?.focus(); }
      }}>{item.label}</button>)}
    </div>
    <section id="financial-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className={styles.panel}>
      <div className={styles.filters}>
        <label className={styles.search}><span>{tab === "expenses" ? "Buscar despesa ou placa" : "Buscar motorista, placa ou modelo"}</span><div><Search size={17} /><input value={filter.search} onChange={event => updateFilters({ search: event.target.value })} placeholder={tab === "expenses" ? "Descrição, categoria ou placa" : "Nome, placa ou modelo"} /></div></label>
        <label><span>{tab === "pending" ? "Vencimento de" : tab === "paid" ? "Recebimento de" : "Despesa de"}</span><input type="date" value={filter.from} max={filter.to || undefined} onChange={event => updateFilters({ from: event.target.value })} /></label>
        <label><span>Até</span><input type="date" value={filter.to} min={filter.from || undefined} onChange={event => updateFilters({ to: event.target.value })} /></label>
        {tab === "pending" && <label><span>Situação</span><select value={filter.situation} onChange={event => updateFilters({ situation: event.target.value })}><option value="">Todas as pendentes</option><option value="overdue">Vencidas</option><option value="upcoming">A vencer em 7 dias</option></select></label>}
        {tab === "expenses" && <label><span>Categoria</span><select value={filter.category} onChange={event => updateFilters({ category: event.target.value })}><option value="">Todas as categorias</option>{summary.data?.categories.map(type => <option key={type} value={type}>{expenseLabel(type)}</option>)}</select></label>}
        <button className={styles.textAction} onClick={() => updateFilters({ ...defaultFilters, limit: filter.limit })}>Limpar filtros</button>
      </div>
      {invalidDates && <p className={styles.filterError} role="alert">A data final deve ser igual ou posterior à data inicial.</p>}
      <div className={styles.listHeading}>
        <p aria-live="polite">{invalidDates ? "Corrija o período para consultar" : list.error ? "Consulta indisponível" : list.isLoading ? "Buscando registros…" : <><strong>{total} {resultName}</strong><span> · Exibindo {firstItem}–{lastItem} de {total}</span></>}</p>
        <div className={styles.listControls}>
          <label>Por página <select value={filter.limit} onChange={event => updateFilters({ limit: Number(event.target.value) })}>{[10, 25, 50].map(value => <option key={value}>{value}</option>)}</select></label>
          {!invalidDates && !list.error && !list.isLoading && pages > 1 && <PageNavigation page={filter.page} pages={pages} setPage={page => updateFilters({ page })} />}
        </div>
      </div>
      {list.isLoading && !invalidDates && !list.error ? <DataTableSkeleton
        columns={tab === "expenses" ? [
          { key: "date", label: "Data" },
          { key: "description", label: "Categoria e descrição", variant: "primary", supportingLine: true },
          { key: "vehicle", label: "Veículo" },
          { key: "amount", label: "Valor", variant: "amount" },
          { key: "actions", label: "Ações", variant: "actions" },
        ] : [
          { key: "driver", label: "Motorista", variant: "primary" },
          { key: "vehicle", label: "Veículo", supportingLine: true },
          { key: "due", label: "Vencimento" },
          { key: "status", label: tab === "paid" ? "Recebimento" : "Situação", variant: tab === "paid" ? "text" : "status" },
          { key: "amount", label: "Valor", variant: "amount" },
          { key: "actions", label: "Ações", variant: "actions" },
        ]}
        rows={6}
        label="Carregando registros financeiros"
        className={styles.tableWrap}
        tableClassName={`${styles.table} ${styles.skeletonTable}`}
      /> : !invalidDates && !list.error && (list.data?.total ?? 0) > 0 ? <div className={styles.tableWrap}><table className={styles.table}>
        <caption className={styles.srOnly}>{tabs.find(item => item.id === tab)!.label}</caption>
        <thead><tr>{(tab === "expenses" ? ["Data", "Categoria e descrição", "Veículo", "Valor", "Ações"] : ["Motorista", "Veículo", "Vencimento", tab === "paid" ? "Recebimento" : "Situação", "Valor", "Ações"]).map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
        <tbody>{tab === "expenses" ? list.data?.expenses?.map(item => <tr key={item.id}>
          <td data-label="Data">{date(item.date)}</td><td data-label="Despesa"><button className={styles.detailLink} onClick={event => showDetail(item, event.currentTarget)}>{expenseLabel(item.type)}</button><span className={styles.secondary}>{item.description}</span></td><td data-label="Veículo">{item.vehicle?.plate || "—"}</td><td data-label="Valor" className={styles.amount}>{money.format(item.value)}</td><td data-label="Ações"><div className={styles.inlineActions}><button onClick={() => { setEditing(item); setModal("expense"); }}><Pencil size={15} /> Editar</button><button onClick={() => setToDelete(item)}><Trash2 size={15} /> Excluir</button></div></td>
        </tr>) : list.data?.payments?.map(item => <tr key={item.id}>
          <td data-label="Motorista"><button className={styles.detailLink} onClick={event => showDetail(item, event.currentTarget)}>{item.contract.driver.name}</button></td><td data-label="Veículo">{item.contract.vehicle.plate}<span className={styles.secondary}>{item.contract.vehicle.model}</span></td><td data-label="Vencimento">{date(item.dueDate)}</td><td data-label={tab === "paid" ? "Recebimento" : "Situação"}>{tab === "paid" ? date(item.paymentDate) : <span className={overdue(item.dueDate) ? styles.overdue : styles.due}>{overdue(item.dueDate) ? "Vencida" : "A vencer"}</span>}</td><td data-label="Valor" className={styles.amount}>{money.format(item.value)}</td><td data-label="Ações">{tab === "pending" ? <button className={styles.rowButton} disabled={paying !== null} onClick={() => void markPaid(item.id)}><Check size={16} />{paying === item.id ? "Confirmando…" : "Confirmar recebimento"}</button> : <button className={styles.detailLink} onClick={event => showDetail(item, event.currentTarget)}>Ver detalhes</button>}</td>
        </tr>)}</tbody>
      </table></div> : !invalidDates && <Empty loading={list.isLoading} error={list.error} text="Nenhum registro encontrado." icon={<CalendarDays size={26} />} retry={() => void list.mutate()}><p>Ajuste os filtros ou registre uma nova movimentação.</p></Empty>}
      {list.data && !list.error && !invalidDates && <Pagination page={filter.page} limit={filter.limit} total={list.data.total} setPage={page => updateFilters({ page })} />}
    </section>
    <dialog ref={drawer} className={styles.drawer} aria-labelledby="detail-title" onCancel={event => { event.preventDefault(); closeDetail(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left) closeDetail(); } }}>
      <div className={styles.drawerHeader}><h2 id="detail-title">Detalhes do lançamento</h2><button aria-label="Fechar detalhes" onClick={closeDetail}><X size={22} /></button></div>
      {detail && <dl className={styles.detailList}><dt>Valor</dt><dd className={styles.amount}>{money.format(detail.value)}</dd>{"contract" in detail ? <><dt>Motorista</dt><dd>{detail.contract.driver.name}</dd><dt>Veículo</dt><dd>{detail.contract.vehicle.plate} · {detail.contract.vehicle.model}</dd><dt>Vencimento</dt><dd>{date(detail.dueDate)}</dd><dt>Recebimento</dt><dd>{detail.paymentDate ? date(detail.paymentDate) : "Ainda não recebido"}</dd></> : <><dt>Categoria</dt><dd>{expenseLabel(detail.type)}</dd><dt>Descrição</dt><dd>{detail.description}</dd><dt>Veículo</dt><dd>{detail.vehicle?.plate || "—"}</dd><dt>Data da despesa</dt><dd>{date(detail.date)}</dd></>}</dl>}
    </dialog>
    <p className={styles.footerNote}>Os pagamentos ficam vinculados aos <Link href="/dashboard/contracts">contratos</Link>.</p>
    <Modal isOpen={modal === "payment"} onClose={close} title="Registrar pagamento">
      {contractsError || driversError || vehiclesError ? <p role="alert">Não foi possível carregar as opções. <button onClick={() => { void retryContracts(); void retryDrivers(); void retryVehicles(); }}>Tentar novamente</button></p>
        : !contracts || !drivers || !vehicles ? <p role="status">Carregando opções…</p>
          : <PaymentForm contracts={contracts} drivers={drivers} vehicles={vehicles} onSave={(data) => void save("/api/payments", data)} onCancel={close} />}
    </Modal>
    <Modal isOpen={modal === "expense"} onClose={close} title={editing ? "Editar despesa" : "Adicionar despesa"} variant="platform">
      {vehiclesError ? <p role="alert">Não foi possível carregar os veículos. <button onClick={() => void retryVehicles()}>Tentar novamente</button></p>
        : !vehicles ? <p role="status">Carregando veículos…</p>
          : <ExpenseForm initialData={editing} isSaving={saving} vehicles={vehicles} onSave={(data) => void save("/api/expenses", data)} onCancel={close} />}
    </Modal>
    <DeleteConfirmationModal isOpen={!!toDelete} onClose={() => setToDelete(null)} onConfirm={deleteExpense} resourceName="despesa" resourceIdentifier={toDelete?.description} isDeleting={deleting} />
  </main>;
}
