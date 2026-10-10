"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { ArrowRight, CircleAlert, CircleDollarSign, Download, Edit2, FileCheck2, FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Contract, Driver, Vehicle, WithoutBaseItem } from "@/types";
import { ContractFilters, ContractWithRelations, useAllDrivers, useAllVehicles, useFetchContracts } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import UpgradeModal from "@/components/ui/UpgradeModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import ContractsFilterBar, { ContractFilterDraft, emptyContractFilters } from "./ContractsFilterBar";
import ContractsTable from "./ContractsTable";
import ContractStatus from "./ContractStatus";
import ContractsSkeleton from "./ContractsSkeleton";
import styles from "../listing.module.css";
import contractStyles from "./contracts.module.css";
import EmptyState from "@/components/ui/EmptyState";

interface Props {
  initialContracts: ContractWithRelations[];
  total: number;
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
  userPlan: string;
  initialSummary: { total: number; active: number; finished: number; activeWeeklyValue: number };
  endingSoon: { id: string; driverName: string; vehiclePlate: string; endDate: string }[];
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const contractDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const limit = 10;

export default function ContractsClientPage({ initialContracts, total: initialTotal, initialDrivers, initialVehicles, userPlan, initialSummary, endingSoon }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [page, setPage] = useState(1);
  const [contractCount, setContractCount] = useState(initialTotal);
  const [filters, setFilters] = useState<ContractFilters>({});
  const [filterDraft, setFilterDraft] = useState<ContractFilterDraft>(emptyContractFilters);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingItem, setEditingItem] = useState<ContractWithRelations | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContractWithRelations | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const active = Object.fromEntries(
        Object.entries(filterDraft).filter(([, value]) => value.trim() !== "")
      ) as ContractFilters;
      setFilters((current) => JSON.stringify(current) === JSON.stringify(active) ? current : active);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterDraft]);

  const useInitialData = page === 1 && Object.keys(filters).length === 0 &&
    sortColumn === "createdAt" && sortDirection === "desc";
  const { contracts, total, isLoading, isError, mutateContracts } = useFetchContracts(
    page, limit, filters, sortColumn, sortDirection,
    useInitialData ? { contracts: initialContracts, total: initialTotal } : undefined
  );
  const { drivers: allDrivers } = useAllDrivers(initialDrivers);
  const { vehicles: allVehicles } = useAllVehicles(initialVehicles);
  const activeFilterCount = Object.keys(filters).length;
  const hasDraftFilters = Object.values(filterDraft).some((value) => value.trim() !== "");
  const showFirstRun = total === 0 && !isError && !isLoading && !hasDraftFilters && activeFilterCount === 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (!isLoading && !isError && page > totalPages) setPage(totalPages);
  }, [isLoading, isError, page, totalPages]);

  const clearFilters = () => {
    setFilterDraft(emptyContractFilters);
    setFilters({});
    setPage(1);
  };
  const openForm = (item: ContractWithRelations | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };
  const closeForm = () => {
    if (isSaving) return;
    setEditingItem(null);
    setIsFormModalOpen(false);
  };
  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  };

  const handleSave = async (formData: WithoutBaseItem<Contract>) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        editingItem ? "/api/contracts/" + editingItem.id : "/api/contracts",
        { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao salvar contrato.");
      }
      if (!editingItem) setContractCount((count) => count + 1);
      await mutateContracts();
      router.refresh();
      void mutate((key) => typeof key === "string" && key.startsWith("/api/vehicles"));
      showToast(editingItem ? "Contrato atualizado com sucesso!" : "Contrato cadastrado com sucesso!", "success");
      setEditingItem(null);
      setIsFormModalOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Falha ao salvar contrato.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const closeDelete = () => {
    if (isDeleting) return;
    setItemToDelete(null);
    setItemsToDelete([]);
  };
  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete.id] : [...itemsToDelete];
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      const response = itemToDelete
        ? await fetch("/api/contracts/" + itemToDelete.id, { method: "DELETE" })
        : await fetch("/api/contracts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Falha ao excluir contratos.");
      }
      setContractCount((count) => Math.max(0, count - ids.length));
      await mutateContracts();
      router.refresh();
      void mutate((key) => typeof key === "string" && key.startsWith("/api/vehicles"));
      showToast(ids.length === 1 ? "Contrato excluído com sucesso!" : "Contratos excluídos com sucesso!", "success");
      setItemToDelete(null);
      setItemsToDelete([]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Falha ao excluir contratos.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (userPlan !== "PROFESSIONAL") {
      setIsUpgradeModalOpen(true);
      return;
    }
    try {
      const response = await fetch("/api/export/contracts");
      if (!response.ok) throw new Error("Falha ao exportar contratos.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contratos-" + Date.now() + ".csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Contratos exportados com sucesso!", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao exportar contratos.", "error");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Operação de locações</span>
          <h1>Contratos</h1>
          <p>Acompanhe locações, valores e a situação dos contratos da sua frota.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleExport} className={styles.secondaryAction} disabled={contractCount === 0} title={contractCount === 0 ? "Cadastre um contrato para exportar o CSV" : undefined}>
            <Download size={18} aria-hidden="true" /> Exportar CSV
          </button>
          <button type="button" onClick={() => openForm()} className={styles.primaryAction}>
            <Plus size={19} aria-hidden="true" /> Adicionar contrato
          </button>
        </div>
      </header>

      <section className={contractStyles.overview} aria-labelledby="contracts-overview-title">
        <div className={contractStyles.overviewHeader}>
          <h2 id="contracts-overview-title">Visão rápida dos contratos</h2>
          <span>Todos os contratos da frota</span>
        </div>
        <div className={contractStyles.metricGrid}>
          <div className={contractStyles.metric}><div className={contractStyles.metricTop}><span>Total de contratos</span><FileText size={18} aria-hidden="true" /></div><strong>{initialSummary.total}</strong><span className={contractStyles.metricNote}>Contratos cadastrados</span></div>
          <div className={contractStyles.metric}><div className={contractStyles.metricTop}><span>Ativos</span><FileCheck2 size={18} aria-hidden="true" /></div><strong>{initialSummary.active}</strong><span className={contractStyles.metricNote}>Locações em andamento</span></div>
          <div className={contractStyles.metric}><div className={contractStyles.metricTop}><span>Encerrados</span><FileText size={18} aria-hidden="true" /></div><strong>{initialSummary.finished}</strong><span className={contractStyles.metricNote}>Locações concluídas</span></div>
          <div className={contractStyles.metric}><div className={contractStyles.metricTop}><span>Soma dos valores semanais contratados</span><CircleDollarSign size={18} aria-hidden="true" /></div><strong className={contractStyles.currencyMetric}>{currency.format(initialSummary.activeWeeklyValue)}</strong><span className={contractStyles.metricNote}>Contratos ativos · não representa recebimentos</span></div>
        </div>
      </section>

      {endingSoon.length > 0 && <section className={contractStyles.endingSoon} aria-labelledby="ending-soon-title">
        <div className={contractStyles.endingSoonHeading}><CircleAlert size={20} aria-hidden="true" /><div><h2 id="ending-soon-title">{endingSoon.length} {endingSoon.length === 1 ? "contrato próximo" : "contratos próximos"} do encerramento</h2><p>Prazo contratual nos próximos 30 dias, calculado pela data de início e duração.</p></div></div>
        <div className={contractStyles.endingSoonLinks}>{endingSoon.map((contract) => <button key={contract.id} type="button" onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}>{contract.driverName} · {contract.vehiclePlate} <span>até {contractDate.format(new Date(contract.endDate))} <ArrowRight size={14} aria-hidden="true" /></span></button>)}</div>
      </section>}

      {showFirstRun && !isLoading && !isError ? (
        <section className={styles.firstRun}>
          <div className={styles.firstRunIcon}><FileText size={28} strokeWidth={1.8} aria-hidden="true" /></div>
          <div className={styles.firstRunCopy}>
            <h2>Cadastre o primeiro contrato</h2>
            <p>Conecte um motorista a um veículo e acompanhe valores, datas e pagamentos em um só lugar.</p>
            <button type="button" className={styles.primaryAction} onClick={() => openForm()}>
              <Plus size={19} aria-hidden="true" /> Cadastrar primeiro contrato
            </button>
          </div>
        </section>
      ) : (
      <section className={contractStyles.listPanel} aria-labelledby="contracts-list-title">
        <div className={contractStyles.listHeader}>
          <div><h2 id="contracts-list-title">Contratos cadastrados</h2><p>Busque, filtre e gerencie as locações da frota.</p></div>
          <span>{total} {total === 1 ? "contrato" : "contratos"}{activeFilterCount > 0 ? " nos resultados" : ""}</span>
        </div>
        <ContractsFilterBar value={filterDraft} onChange={setFilterDraft} onClear={clearFilters} activeCount={activeFilterCount} />
      {isLoading && contracts.length === 0 ? (
        <ContractsSkeleton />
      ) : isError && contracts.length === 0 ? (
        <div className={contractStyles.panelMessage}><EmptyState Icon={CircleAlert} role="alert" title="Não foi possível carregar os contratos" description="Verifique a conexão e tente novamente." actionButton={<button type="button" onClick={() => mutateContracts()}>Tentar novamente</button>} /></div>
      ) : total === 0 ? (
        <div className={contractStyles.panelMessage}><EmptyState Icon={FileText} title="Nenhum contrato encontrado" description="Altere os filtros para ver outros contratos da frota." actionButton={<button type="button" onClick={clearFilters}>Limpar filtros <ArrowRight size={17} aria-hidden="true" /></button>} /></div>
      ) : (
        <>
          <div className={styles.desktopTable}>
            <ContractsTable contracts={contracts} onOpen={(id) => router.push("/dashboard/contracts/" + id)}
              onEdit={openForm} onDelete={setItemToDelete} onBulkDelete={setItemsToDelete}
              onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
          <div className={`${styles.mobileList} ${contractStyles.listMobileList}`}>
            {contracts.map((contract) => (
              <article key={contract.id} className={`${styles.mobileItem} ${contractStyles.listMobileItem}`}>
                <div className={styles.mobileItemTop}>
                  <div>
                    <button type="button" className={styles.plateLink} onClick={() => router.push("/dashboard/contracts/" + contract.id)}>{contract.driver.name}</button>
                    <p>{contract.vehicle.plate} · {contract.vehicle.model}</p>
                  </div>
                  <ContractStatus status={contract.status} />
                </div>
                <div className={contractStyles.mobileDetails}>
                  <span><strong>Início</strong> {contractDate.format(new Date(contract.startDate))}</span>
                  <span><strong>{currency.format(contract.weeklyValue)}</strong> por semana</span>
                  <span>{contract.duration ? contract.duration + " semanas" : "Duração indeterminada"}</span>
                </div>
                <div className={styles.mobileActions}>
                  <button type="button" onClick={() => openForm(contract)}><Edit2 size={17} aria-hidden="true" /> Editar</button>
                  <button type="button" onClick={() => setItemToDelete(contract)}><Trash2 size={17} aria-hidden="true" /> Excluir</button>
                </div>
              </article>
            ))}
          </div>
          <nav className={`${styles.pagination} ${contractStyles.listPagination}`} aria-label="Paginação de contratos">
            <span>Mostrando {contracts.length} de {total} contratos</span>
            <div>
              <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
              <span>Página {page} de {totalPages}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Próximo</button>
            </div>
          </nav>
        </>
      )}
      </section>
      )}

      <Modal isOpen={isFormModalOpen} onClose={closeForm} title={editingItem ? "Editar contrato" : "Novo contrato"} size="4xl" variant="platform">
        <ContractForm initialData={editingItem} vehicles={allVehicles || []} drivers={allDrivers || []}
          isSaving={isSaving} onSave={handleSave} onCancel={closeForm} />
      </Modal>
      <DeleteConfirmationModal isOpen={!!itemToDelete || itemsToDelete.length > 0} onClose={closeDelete}
        onConfirm={confirmDelete} resourceName={itemToDelete ? "contrato" : itemsToDelete.length + " contratos"}
        resourceIdentifier={itemToDelete ? "do motorista " + itemToDelete.driver.name : "selecionados"}
        isDeleting={isDeleting} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="exportar contratos" monthlyPrice="R$ 49,90" annualPrice="R$ 499" annualSavings="Economize R$ 99,80" />
    </div>
  );
}
