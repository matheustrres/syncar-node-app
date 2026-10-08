"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { Maintenance, Vehicle, WithoutBaseItem } from "@/types";
import {
  useFetchMaintenance,
  useAllVehicles,
  MaintenanceWithRelations,
  MaintenanceFilters,
} from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import MaintenanceForm from "@/components/forms/MaintenanceForm";
import { Plus, Edit2, Trash2, Wrench, ArrowRight, CircleAlert } from "lucide-react";
import MaintenanceSkeleton from "./MaintenanceSkeleton";
import MaintenanceFilterBar, { emptyMaintenanceFilters, MaintenanceFilterDraft } from "./MaintenanceFilterBar";
import MaintenanceTable, { formatCost, formatDate, formatMileage, maintenanceTypeLabels } from "./MaintenanceTable";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import UpgradeModal from "@/components/ui/UpgradeModal";
import styles from "../vehicles/vehicles.module.css";
import local from "./maintenance.module.css";
import EmptyState from "@/components/ui/EmptyState";

interface MaintenanceClientPageProps {
  initialMaintenance: MaintenanceWithRelations[];
  total: number;
  initialVehicles: Vehicle[];
  userPlan: string;
}

export default function MaintenanceClientPage({
  initialMaintenance,
  total: initialTotal,
  initialVehicles,
  userPlan,
}: MaintenanceClientPageProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [maintenanceCount, setMaintenanceCount] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [filterDraft, setFilterDraft] = useState<MaintenanceFilterDraft>({ ...emptyMaintenanceFilters });
  const [filters, setFilters] = useState<MaintenanceFilters>({});
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const active = Object.fromEntries(Object.entries(filterDraft).filter(([, value]) => value.trim() !== "")) as MaintenanceFilters;
      setFilters((current) => JSON.stringify(current) === JSON.stringify(active) ? current : active);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterDraft]);

  const useInitialData = page === 1 && Object.keys(filters).length === 0 && sortColumn === "date" && sortDirection === "desc";

  const { maintenance, total, isLoading, isError, mutateMaintenance } =
    useFetchMaintenance(page, limit, filters, sortColumn, sortDirection, useInitialData ? {
      maintenance: initialMaintenance,
      total: initialTotal,
    } : undefined);

  const { vehicles: allVehicles } = useAllVehicles(initialVehicles);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<MaintenanceWithRelations | null>(null);
  const [itemToDelete, setItemToDelete] =
    useState<MaintenanceWithRelations | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenFormModal = (
    item: MaintenanceWithRelations | null = null
  ) => {
    if (userPlan === "BASIC" && maintenanceCount >= 3 && !item) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (formData: WithoutBaseItem<Maintenance>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `/api/maintenance/${editingItem.id}`
      : "/api/maintenance";

    const vehicleInfo = (allVehicles || []).find(
      (v) => v.id === formData.vehicleId
    );

    if (!vehicleInfo) {
      showToast(
        "Erro: O veículo selecionado não foi encontrado. Tente novamente.",
        "error"
      );
      return;
    }

    const optimisticData = editingItem
      ? maintenance.map((m) =>
          m.id === editingItem.id
            ? { ...m, ...formData, vehicle: vehicleInfo }
            : m
        )
      : [
          {
            ...(formData as Maintenance),
            id: "temp-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "temp-user-id", // This will be replaced by the server response
            vehicle: vehicleInfo,
          },
          ...maintenance,
        ];
    const options = {
      optimisticData: { maintenance: optimisticData, total },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsSaving(true);
    handleCloseFormModal();
    try {
      await mutateMaintenance(async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            cost: formData.cost?.toString(), // Ensure cost is sent as string for API
            mileage: formData.mileage?.toString(), // Ensure mileage is sent as string for API
            nextServiceMileage: formData.nextServiceMileage?.toString(),
          }),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }
        const savedMaintenance = await response.json();
        if (!editingItem) setMaintenanceCount((count) => count + 1);
        showToast(
          `Manutenção ${editingItem ? "atualizada" : "cadastrada"} com sucesso!`,
          "success"
        );
        // Replace temp-id with the real id
        const finalData = optimisticData.map((m) =>
          m.id === "temp-id" ? savedMaintenance : m
        );
        return {
          maintenance: finalData,
          total: editingItem ? total : total + 1,
        };
      }, options);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleDeleteClick = (item: MaintenanceWithRelations) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const optimisticData = maintenance.filter((m) => m.id !== itemToDelete.id);
    const options = {
      optimisticData: { maintenance: optimisticData, total: total - 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemToDelete(null);
    try {
      await mutateMaintenance(async () => {
        const response = await fetch(`/api/maintenance/${itemToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Falha ao excluir");
        }
        setMaintenanceCount((count) => Math.max(0, count - 1));
        showToast("Manutenção excluída com sucesso!", "success");
        return { maintenance: optimisticData, total: total - 1 };
      }, options);
    } catch {
      showToast("Falha ao excluir manutenção.", "error");
    }
    setIsDeleting(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const idsToDelete = [...itemsToDelete];
    const optimisticData = maintenance.filter(
      (m) => !idsToDelete.includes(m.id)
    );
    const options = {
      optimisticData: {
        maintenance: optimisticData,
        total: total - idsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemsToDelete([]);
    try {
      await mutateMaintenance(async () => {
        const response = await fetch("/api/maintenance", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        if (!response.ok) throw new Error("Falha ao excluir manutenções.");
        setMaintenanceCount((count) => Math.max(0, count - idsToDelete.length));
        showToast("Manutenções excluídas com sucesso!", "success");
        return {
          maintenance: optimisticData,
          total: total - idsToDelete.length,
        };
      }, options);
    } catch {
      showToast("Falha ao excluir manutenções.", "error");
    }
    setIsDeleting(false);
  };

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (!isLoading && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, totalPages]);

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const isFiltersEmpty = Object.keys(filters).length === 0;
  const activeFilterCount = Object.values(filterDraft).filter((value) => value.trim() !== "").length;
  const showFirstRun = maintenanceCount === 0 && isFiltersEmpty && activeFilterCount === 0;
  const hasVehicles = (allVehicles?.length ?? 0) > 0;
  const clearFilters = () => {
    setFilterDraft({ ...emptyMaintenanceFilters });
    setFilters({});
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Cuidado com a frota</span>
          <h1>Manutenções</h1>
          <p>Registre serviços, custos e quilometragem de cada veículo.</p>
        </div>
        {hasVehicles ? (
          <button type="button" className={styles.primaryAction} onClick={() => handleOpenFormModal()}>
            <Plus size={19} aria-hidden="true" /> Nova manutenção
          </button>
        ) : (
          <Link href="/dashboard/vehicles" className={styles.primaryAction}>
            <Plus size={19} aria-hidden="true" /> Cadastrar veículo
          </Link>
        )}
      </header>

      {(!showFirstRun || isLoading) && (
        <MaintenanceFilterBar
          value={filterDraft}
          onChange={setFilterDraft}
          onClear={clearFilters}
          activeCount={activeFilterCount}
        />
      )}

      {isLoading ? (
        <MaintenanceSkeleton />
      ) : isError ? (
        <EmptyState Icon={CircleAlert} role="alert" title="Não foi possível carregar as manutenções" description="Verifique a conexão e tente novamente." actionButton={<button type="button" onClick={() => mutateMaintenance()}>Tentar novamente</button>} />
      ) : showFirstRun ? (
        <section className={styles.firstRun}>
          <div className={styles.firstRunIcon}><Wrench size={28} strokeWidth={1.8} aria-hidden="true" /></div>
          <div className={styles.firstRunCopy}>
            <h2>{hasVehicles ? "Cuide da frota com tudo registrado" : "Comece cadastrando sua frota"}</h2>
            <p>{hasVehicles
              ? "Registre a primeira manutenção para acompanhar serviços, custos e próximos cuidados em um só lugar."
              : "Cadastre um veículo para começar a acompanhar seu histórico de manutenções."}</p>
            {hasVehicles ? (
              <button type="button" className={styles.primaryAction} onClick={() => handleOpenFormModal()}>
                <Plus size={19} aria-hidden="true" /> Registrar primeira manutenção
              </button>
            ) : (
              <Link href="/dashboard/vehicles" className={styles.primaryAction}>
                Cadastrar primeiro veículo <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
          {userPlan === "BASIC" && hasVehicles && <span className={styles.firstRunNote}>Plano Básico: até 3 manutenções cadastradas.</span>}
        </section>
      ) : total === 0 ? (
        <EmptyState Icon={Wrench} title="Nenhuma manutenção encontrada" description="Altere os filtros para consultar outros registros." actionButton={<button type="button" onClick={clearFilters}>Limpar filtros <ArrowRight size={17} aria-hidden="true" /></button>} />
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <h2>Histórico de manutenção</h2>
            <span>{total} {total === 1 ? "manutenção" : "manutenções"}{!isFiltersEmpty ? " nos resultados" : ""}</span>
          </div>
          <div className={styles.desktopTable}>
            <MaintenanceTable maintenance={maintenance} onEdit={handleOpenFormModal} onDelete={handleDeleteClick} onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} onBulkDelete={handleBulkDelete} />
          </div>
          <div className={styles.mobileList}>
            {maintenance.map((item) => (
              <article key={item.id} className={styles.mobileItem}>
                <div className={styles.mobileItemTop}>
                  <div>
                    <strong className={local.vehiclePlate}>{item.vehicle.plate}</strong>
                    <p>{item.vehicle.model}</p>
                  </div>
                  <span className={local.typeBadge}>{maintenanceTypeLabels[item.type] || item.type}</span>
                </div>
                <p className={local.mobileDescription}>{item.description}</p>
                <dl className={local.mobileDetails}>
                  <div><dt>Data</dt><dd>{formatDate(item.date)}</dd></div>
                  <div><dt>Quilometragem</dt><dd>{formatMileage(item.mileage)}</dd></div>
                  <div><dt>Custo</dt><dd>{formatCost(item.cost)}</dd></div>
                </dl>
                <div className={styles.mobileActions}>
                  <button type="button" onClick={() => handleOpenFormModal(item)}><Edit2 size={17} aria-hidden="true" /> Editar</button>
                  <button type="button" onClick={() => handleDeleteClick(item)}><Trash2 size={17} aria-hidden="true" /> Excluir</button>
                </div>
              </article>
            ))}
          </div>
          <nav className={styles.pagination} aria-label="Paginação de manutenções">
            <span>Mostrando {maintenance.length} de {total} manutenções</span>
            <div>
              <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
              <span>Página {page} de {totalPages}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Próximo</button>
            </div>
          </nav>
        </>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar Manutenção" : "Nova Manutenção"}
        size="4xl"
        variant="platform"
      >
        <MaintenanceForm
          initialData={editingItem}
          vehicles={allVehicles || []}
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
          itemToDelete ? "manutenção" : `${itemsToDelete.length} manutenções`
        }
        resourceIdentifier={
          itemToDelete
            ? `do veículo ${itemToDelete?.vehicle.plate}`
            : "selecionadas"
        }
        isDeleting={isDeleting}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="manutenções"
        monthlyPrice="R$ 49,90"
        annualPrice="R$ 499"
        annualSavings="Economize R$ 99,80"
      />
    </div>
  );
}
