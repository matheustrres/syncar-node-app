"use client";

import { useState } from "react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { AlertCircle, ArrowDownLeft, CalendarDays, Check, CheckCircle2, Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Contract, Driver, Vehicle } from "@/types";
import { ExpenseWithRelations, PaymentWithRelations, useAllContracts, useAllDrivers, useAllVehicles, useFetchPaidPayments, useFetchPendingPayments, useFetchRecentExpenses } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import PaymentForm from "@/components/forms/PaymentForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import styles from "./financial.module.css";

interface Props {
  initialPendingPayments: { payments: PaymentWithRelations[]; total: number };
  initialPaidPayments: { payments: PaymentWithRelations[]; total: number };
  initialRecentExpenses: { expenses: ExpenseWithRelations[]; total: number };
  initialContracts: Contract[];
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
}

const LIMIT = 10;
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const date = (value: string | null | undefined) => value ? dateFormat.format(new Date(value)) : "Data não informada";
function overdue(value: string) {
  const now = new Date();
  return Date.parse(value) < Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}
function Pagination({ page, total, setPage }: { page: number; total: number; setPage: (page: number) => void }) {
  if (total <= LIMIT) return null;
  const pages = Math.ceil(total / LIMIT);
  return <div className={styles.pagination}><span>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Próxima</button></div></div>;
}
function Empty({ loading, error, text, retry, icon, children }: { loading: boolean; error: unknown; text: string; retry: () => void; icon: React.ReactNode; children?: React.ReactNode }) {
  return <div className={styles.empty}>{loading ? <p role="status">Carregando registros…</p> : error ? <p role="alert">Não foi possível carregar os registros. <button className={styles.textAction} onClick={retry}>Tentar novamente</button></p> : <><span className={styles.emptyVisual} aria-hidden="true">{icon}</span><div className={styles.emptyCopy}><p>{text}</p>{children}</div></>}</div>;
}

export default function FinancialClientPage({ initialPendingPayments, initialPaidPayments, initialRecentExpenses, initialContracts, initialDrivers, initialVehicles }: Props) {
  const [pendingPage, setPendingPage] = useState(1);
  const [paidPage, setPaidPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);
  const pending = useFetchPendingPayments(pendingPage, LIMIT, pendingPage === 1 ? initialPendingPayments : undefined);
  const paid = useFetchPaidPayments(paidPage, LIMIT, paidPage === 1 ? initialPaidPayments : undefined);
  const expenses = useFetchRecentExpenses(expensesPage, LIMIT, expensesPage === 1 ? initialRecentExpenses : undefined);
  const { contracts } = useAllContracts(initialContracts);
  const { drivers } = useAllDrivers(initialDrivers);
  const { vehicles } = useAllVehicles(initialVehicles);
  const { mutate } = useSWRConfig();
  const { showToast } = useToast();
  const [modal, setModal] = useState<"payment" | "expense" | null>(null);
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
      setModal(null); setEditing(null); setPendingPage(1); setPaidPage(1); setExpensesPage(1);
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
      setPendingPage(1); setPaidPage(1); void refresh();
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
      setToDelete(null); setExpensesPage(1); void refresh();
      showToast("Despesa excluída com sucesso.", "success");
    } catch { showToast("Não foi possível excluir a despesa. Tente novamente.", "error"); }
    finally { setDeleting(false); }
  }
  return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Operação financeira</span><h1>Financeiro</h1><p>Confira o que falta receber, registre despesas e acompanhe os recebimentos.</p></div><div className={styles.headerActions}><button className={styles.secondaryAction} onClick={() => setModal("payment")}><Plus size={18} /> Registrar pagamento</button><button className={styles.primaryAction} onClick={() => setModal("expense")}><Plus size={18} /> Adicionar despesa</button></div></header>
    <section className={styles.section} aria-labelledby="pending-heading">
      <div className={styles.sectionHeading}><div className={styles.sectionTitle}><span className={styles.headingIcon}><AlertCircle size={20} /></span><div><h2 id="pending-heading">A receber</h2><p>Pagamentos pendentes, ordenados pelo vencimento.</p></div></div>{pending.data && <span className={styles.count}>{pending.data.total} {pending.data.total === 1 ? "pendente" : "pendentes"}</span>}</div>
      <div className={styles.panel}>{pending.data?.payments.length && !pending.isError ? <div className={styles.rows}>{pending.data.payments.map((item) => <div className={styles.row} key={item.id}><div className={styles.rowMain}><strong>{item.contract.driver.name}</strong><span>{item.contract.vehicle.plate} · {item.contract.vehicle.model}</span></div><div className={styles.rowMeta}><span className={overdue(item.dueDate) ? styles.overdue : styles.due}><CalendarDays size={15} /> {overdue(item.dueDate) ? "Vencido em" : "Vence em"} {date(item.dueDate)}</span></div><div className={styles.rowEnd}><strong className={styles.amount}>{money.format(item.value)}</strong><button className={styles.rowButton} disabled={paying !== null} onClick={() => void markPaid(item.id)}><Check size={16} /> {paying === item.id ? "Confirmando…" : "Confirmar recebimento"}</button></div></div>)}</div> : <Empty loading={pending.isLoading} error={pending.isError} text="Nenhum pagamento pendente no momento." icon={<CalendarDays size={26} strokeWidth={1.7} />} retry={() => void pending.mutate()}><p>Registre um pagamento vinculado a um contrato para acompanhar o vencimento aqui.</p><button className={styles.textAction} onClick={() => setModal("payment")}>Registrar pagamento <Plus size={15} /></button></Empty>}<Pagination page={pendingPage} total={pending.data?.total || 0} setPage={setPendingPage} /></div>
    </section>
    <div className={styles.lowerGrid}>
      <section className={styles.section} aria-labelledby="expenses-heading"><div className={styles.sectionHeading}><div className={styles.sectionTitle}><span className={styles.headingIcon}><ReceiptText size={20} /></span><div><h2 id="expenses-heading">Despesas recentes</h2><p>Últimos lançamentos da operação.</p></div></div>{expenses.data && <span className={styles.count}>{expenses.data.total} {expenses.data.total === 1 ? "despesa" : "despesas"}</span>}</div><div className={styles.panel}>{expenses.data?.expenses.length && !expenses.isError ? <div className={styles.rows}>{expenses.data.expenses.map((item) => <div className={styles.compactRow} key={item.id}><div className={styles.rowMain}><strong>{item.type}</strong><span>{item.description}{item.vehicle?.plate ? ` · ${item.vehicle.plate}` : ""}</span><small>{date(item.date)}</small></div><div className={styles.compactEnd}><strong className={styles.amount}>{money.format(item.value)}</strong><div className={styles.inlineActions}><button onClick={() => { setEditing(item); setModal("expense"); }}><Pencil size={15} /> Editar</button><button onClick={() => setToDelete(item)}><Trash2 size={15} /> Excluir</button></div></div></div>)}</div> : <Empty loading={expenses.isLoading} error={expenses.isError} text="Nenhuma despesa registrada ainda." icon={<ReceiptText size={26} strokeWidth={1.7} />} retry={() => void expenses.mutate()}><button className={styles.textAction} onClick={() => setModal("expense")}>Adicionar primeira despesa <Plus size={15} /></button></Empty>}<Pagination page={expensesPage} total={expenses.data?.total || 0} setPage={setExpensesPage} /></div></section>
      <section className={styles.section} aria-labelledby="paid-heading"><div className={styles.sectionHeading}><div className={styles.sectionTitle}><span className={styles.headingIcon}><ArrowDownLeft size={20} /></span><div><h2 id="paid-heading">Recebimentos</h2><p>Pagamentos confirmados, do mais recente ao mais antigo.</p></div></div>{paid.data && <span className={styles.count}>{paid.data.total} {paid.data.total === 1 ? "recebido" : "recebidos"}</span>}</div><div className={styles.panel}>{paid.data?.payments.length && !paid.isError ? <div className={styles.rows}>{paid.data.payments.map((item) => <div className={styles.compactRow} key={item.id}><div className={styles.rowMain}><strong>{item.contract.driver.name}</strong><span>{item.contract.vehicle.plate} · {item.contract.vehicle.model}</span><small>Vencimento: {date(item.dueDate)}</small></div><div className={styles.compactEnd}><strong className={styles.amount}>{money.format(item.value)}</strong><span className={styles.received}><CheckCircle2 size={15} /> {item.paymentDate ? `Recebido em ${date(item.paymentDate)}` : "Recebido · data não informada"}</span></div></div>)}</div> : <Empty loading={paid.isLoading} error={paid.isError} text="Nenhum pagamento recebido ainda." icon={<ArrowDownLeft size={26} strokeWidth={1.7} />} retry={() => void paid.mutate()}><p>Confirme uma cobrança em “A receber” ou registre um pagamento.</p></Empty>}<Pagination page={paidPage} total={paid.data?.total || 0} setPage={setPaidPage} /></div></section>
    </div>
    <p className={styles.footerNote}>Os pagamentos ficam vinculados aos <Link href="/dashboard/contracts">contratos</Link>.</p>
    <Modal isOpen={modal === "payment"} onClose={close} title="Registrar pagamento"><PaymentForm contracts={contracts || []} drivers={drivers || []} vehicles={vehicles || []} onSave={(data) => void save("/api/payments", data)} onCancel={close} /></Modal>
    <Modal isOpen={modal === "expense"} onClose={close} title={editing ? "Editar despesa" : "Adicionar despesa"} variant="platform"><ExpenseForm initialData={editing} isSaving={saving} vehicles={vehicles || []} onSave={(data) => void save("/api/expenses", data)} onCancel={close} /></Modal>
    <DeleteConfirmationModal isOpen={!!toDelete} onClose={() => setToDelete(null)} onConfirm={deleteExpense} resourceName="despesa" resourceIdentifier={toDelete?.description} isDeleting={deleting} />
  </main>;
}
