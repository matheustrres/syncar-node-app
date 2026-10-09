"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Driver, WithoutBaseItem } from "@/types";
import { DriverFilters, useFetchDrivers } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import { Plus, Edit2, Trash2, UsersRound, Download, ArrowRight, CircleAlert, UserCheck, UserX, IdCard } from "lucide-react";
import DriversSkeleton from "./DriversSkeleton";
import UpgradeModal from "@/components/ui/UpgradeModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import DriversFilterBar, { DriverFilterDraft, emptyDriverFilters } from "./DriversFilterBar";
import DriversTable from "./DriversTable";
import DriverStatus from "./DriverStatus";
import styles from "../listing.module.css";
import driverStyles from "./drivers.module.css";
import EmptyState from "@/components/ui/EmptyState";

interface ClientPageProps {
  initialDrivers: Driver[];
  total: number;
  initialSummary: { total: number; active: number; inactive: number; missingCnh: number };
}

export default function DriversClientPage({
  initialDrivers,
  total: initialTotal,
  initialSummary,
}: ClientPageProps) {
  const { data: session, status } = useSession();
  const userPlan = status === "authenticated" ? session.user.plan : "BASIC";
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DriverFilters>({});
  const [filterDraft, setFilterDraft] = useState<DriverFilterDraft>(emptyDriverFilters);
  const [driverCount, setDriverCount] = useState(initialTotal);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const active = Object.fromEntries(
        Object.entries(filterDraft).filter(([, value]) => value.trim() !== "")
      ) as DriverFilters;
      setFilters((current) => JSON.stringify(current) === JSON.stringify(active) ? current : active);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterDraft]);

  const useInitialData = page === 1 && Object.keys(filters).length === 0 && sortColumn === "createdAt" && sortDirection === "desc";

  const { drivers, total, isError, isLoading, mutateDrivers } = useFetchDrivers(
    page,
    limit,
    filters,
    sortColumn,
    sortDirection,
    useInitialData ? {
      drivers: initialDrivers,
      total: initialTotal,
    } : undefined
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Driver | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  const { showToast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);

  const isAtLimit = userPlan === "BASIC" && driverCount >= 3;

  const handleOpenFormModal = (item: Driver | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    if (isAtLimit) {
      setIsUpgradeModalOpen(true);
    } else {
      handleOpenFormModal();
    }
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData: WithoutBaseItem<Driver>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/drivers/${editingItem.id}` : "/api/drivers";
    const optimisticData = editingItem
      ? drivers.map((d) =>
          d.id === editingItem.id ? { ...d, ...formData } : d
        )
      : [
          {
            ...(formData as Driver),
            id: "temp-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "temp-user-id", // This will be replaced by the server response
          },
          ...drivers,
        ];
    const options = {
      optimisticData: { drivers: optimisticData, total: editingItem ? total : total + 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsSaving(true);
    try {
      await mutateDrivers(async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }
        const savedDriver = await response.json();
        if (!editingItem) setDriverCount((count) => count + 1);
        showToast(
          `Motorista ${editingItem ? "atualizado" : "cadastrado"} com sucesso!`,
          "success"
        );
        // Replace temp-id with the real id
        const finalData = optimisticData.map((d) =>
          d.id === "temp-id" ? savedDriver : d
        );
        return { drivers: finalData, total: editingItem ? total : total + 1 };
      }, options);
      handleCloseFormModal();
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleDeleteClick = (item: Driver) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const optimisticData = drivers.filter((d) => d.id !== itemToDelete.id);
    const options = {
      optimisticData: { drivers: optimisticData, total: total - 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    try {
      await mutateDrivers(async () => {
        const response = await fetch(`/api/drivers/${itemToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Falha ao excluir");
        }
        setDriverCount((count) => Math.max(0, count - 1));
        showToast("Motorista excluído com sucesso!", "success");
        return { drivers: optimisticData, total: total - 1 };
      }, options);
      setItemToDelete(null);
      router.refresh();
    } catch {
      showToast("Falha ao excluir motorista.", "error");
    }

    setIsDeleting(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const idsToDelete = [...itemsToDelete];
    if (idsToDelete.length === 0) return;
    const optimisticData = drivers.filter(
      (driver) => !idsToDelete.includes(driver.id)
    );
    const options = {
      optimisticData: {
        drivers: optimisticData,
        total: total - idsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    try {
      await mutateDrivers(async () => {
        const response = await fetch("/api/drivers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        if (!response.ok) throw new Error("Falha ao excluir motoristas");
        setDriverCount((count) => Math.max(0, count - idsToDelete.length));
        showToast("Motoristas excluídos com sucesso!", "success");
        return {
          drivers: optimisticData,
          total: total - idsToDelete.length,
        };
      }, options);
      setItemsToDelete([]);
      router.refresh();
    } catch {
      showToast("Falha ao excluir motoristas.", "error");
    }
    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/drivers/${itemId}`);
  };

  const handleExportClick = () => {
    if (userPlan !== "PROFESSIONAL") {
      setIsUpgradeModalOpen(true);
    } else {
      handleExport();
    }
  };

  const handleExport = async () => {
    try {
      showToast("Gerando CSV...", "success");
      const response = await fetch("/api/export/drivers");
      if (!response.ok) {
        throw new Error("Falha ao exportar motoristas.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `motoristas-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Motoristas exportados com sucesso!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao exportar motoristas.",
        "error"
      );
    }
  };

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (!isLoading && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [isLoading, page, totalPages]);

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const isFiltersEmpty = Object.keys(filters).length === 0;
  const activeFilterCount = Object.values(filterDraft).filter((value) => value.trim() !== "").length;
  const showFirstRun = total === 0 && isFiltersEmpty && activeFilterCount === 0;
  const clearFilters = () => {
    setFilterDraft({ ...emptyDriverFilters });
    setFilters({});
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Equipe da operação</span>
          <h1>Motoristas</h1>
          <p>Consulte os dados e a situação dos motoristas da sua frota.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleExportClick} className={styles.secondaryAction} disabled={driverCount === 0} title={driverCount === 0 ? "Cadastre um motorista para exportar o CSV" : undefined}>
            <Download size={18} aria-hidden="true" /> Exportar CSV
          </button>
          <button type="button" onClick={handleAddClick} className={styles.primaryAction}>
            <Plus size={19} aria-hidden="true" /> Adicionar motorista
          </button>
        </div>
      </header>

      <section className={driverStyles.overview} aria-labelledby="drivers-overview-title">
        <div className={driverStyles.overviewHeader}>
          <h2 id="drivers-overview-title">Visão rápida da equipe</h2>
          <span>Todos os motoristas cadastrados</span>
        </div>
        <div className={driverStyles.metricGrid}>
          <div className={driverStyles.metric}><div className={driverStyles.metricTop}><span>Total de motoristas</span><UsersRound size={18} aria-hidden="true" /></div><strong>{initialSummary.total}</strong><span className={driverStyles.metricNote}>Pessoas cadastradas</span></div>
          <div className={driverStyles.metric}><div className={driverStyles.metricTop}><span>Ativos</span><UserCheck size={18} aria-hidden="true" /></div><strong>{initialSummary.active}</strong><span className={driverStyles.metricNote}>Disponíveis na operação</span></div>
          <div className={driverStyles.metric}><div className={driverStyles.metricTop}><span>Inativos</span><UserX size={18} aria-hidden="true" /></div><strong>{initialSummary.inactive}</strong><span className={driverStyles.metricNote}>Fora da operação</span></div>
          <div className={`${driverStyles.metric} ${initialSummary.missingCnh > 0 ? driverStyles.pendingMetric : ""}`}><div className={driverStyles.metricTop}><span>CNH não informada</span><IdCard size={18} aria-hidden="true" /></div><strong>{initialSummary.missingCnh}</strong>{initialSummary.missingCnh > 0 ? <button type="button" className={driverStyles.pendingAction} onClick={() => { setFilterDraft({ ...emptyDriverFilters, missingCnh: "true" }); document.getElementById("drivers-list-title")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Ver pendências <ArrowRight size={15} aria-hidden="true" /></button> : <span className={driverStyles.metricNote}>Documentação informada</span>}</div>
        </div>
      </section>

      {showFirstRun && !isLoading && !isError ? (
        <section className={styles.firstRun}>
          <div className={styles.firstRunIcon}><UsersRound size={28} strokeWidth={1.8} aria-hidden="true" /></div>
          <div className={styles.firstRunCopy}>
            <h2>Cadastre o primeiro motorista</h2>
            <p>Reúna contatos, documentos e situação de cada motorista para encontrar as informações quando precisar.</p>
            <button type="button" className={styles.primaryAction} onClick={handleAddClick}><Plus size={19} aria-hidden="true" /> Cadastrar primeiro motorista</button>
          </div>
          {userPlan === "BASIC" && <span className={styles.firstRunNote}>Plano Básico: até 3 motoristas cadastrados.</span>}
        </section>
      ) : (
      <section className={driverStyles.listPanel} aria-labelledby="drivers-list-title">
        <div className={driverStyles.listHeader}>
          <div><h2 id="drivers-list-title">Motoristas cadastrados</h2><p>Busque, filtre e gerencie a equipe da frota.</p></div>
          <span>{total} {total === 1 ? "motorista" : "motoristas"}{!isFiltersEmpty ? " nos resultados" : ""}</span>
        </div>
        <DriversFilterBar value={filterDraft} onChange={setFilterDraft} onClear={clearFilters} activeCount={activeFilterCount} />
      {isLoading ? (
        <DriversSkeleton />
      ) : isError ? (
        <div className={driverStyles.panelMessage}><EmptyState Icon={CircleAlert} role="alert" title="Não foi possível carregar os motoristas" description="Verifique a conexão e tente novamente." actionButton={<button type="button" onClick={() => mutateDrivers()}>Tentar novamente</button>} /></div>
      ) : total === 0 ? (
        <div className={driverStyles.panelMessage}><EmptyState Icon={UsersRound} title="Nenhum motorista encontrado" description="Altere os filtros para ver outros motoristas da frota." actionButton={<button type="button" onClick={clearFilters}>Limpar filtros <ArrowRight size={17} aria-hidden="true" /></button>} /></div>
      ) : (
        <>
          <div className={styles.desktopTable}>
            <DriversTable drivers={drivers} onOpen={handleRowClick} onEdit={handleOpenFormModal} onDelete={handleDeleteClick} onBulkDelete={handleBulkDelete} onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
          <div className={`${styles.mobileList} ${driverStyles.listMobileList}`}>
            {drivers.map((driver) => (
              <article key={driver.id} className={`${styles.mobileItem} ${driverStyles.listMobileItem}`}>
                <div className={styles.mobileItemTop}>
                  <div>
                    <button type="button" className={styles.plateLink} onClick={() => handleRowClick(driver.id)}>{driver.name}</button>
                    <p>CPF: {driver.cpf}</p>
                  </div>
                  <DriverStatus status={driver.status} />
                </div>
                <div className={driverStyles.mobileDetails}>
                  <span>{driver.phone}</span>
                  {driver.email && <span>{driver.email}</span>}
                  {!driver.cnh && <span className={driverStyles.documentMissing}>CNH não informada</span>}
                </div>
                <div className={styles.mobileActions}>
                  <button type="button" onClick={() => handleOpenFormModal(driver)}><Edit2 size={17} aria-hidden="true" /> {driver.cnh ? "Editar" : "Informar CNH"}</button>
                  <button type="button" onClick={() => handleDeleteClick(driver)}><Trash2 size={17} aria-hidden="true" /> Excluir</button>
                </div>
              </article>
            ))}
          </div>
          <nav className={`${styles.pagination} ${driverStyles.listPagination}`} aria-label="Paginação de motoristas">
            <span>Mostrando {drivers.length} de {total} motoristas</span>
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar motorista" : "Criar motorista"}
        size="4xl"
        variant="platform"
      >
        <DriverForm
          initialData={editingItem}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete || itemsToDelete.length > 0}
        onClose={handleCloseDeleteModal}
        onConfirm={itemToDelete ? handleConfirmDelete : handleConfirmBulkDelete}
        resourceName={
          itemToDelete ? "motorista" : `${itemsToDelete.length} motoristas`
        }
        resourceIdentifier={itemToDelete ? itemToDelete.name : "selecionados"}
        isDeleting={isDeleting}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="motoristas"
        monthlyPrice="R$ 49,90"
        annualPrice="R$ 499"
        annualSavings="Economize R$ 99,80"
      />
    </div>
  );
}
