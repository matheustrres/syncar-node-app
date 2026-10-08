"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Vehicle, WithoutBaseItem } from "@/types";
import { useFetchVehicles, VehicleFilters } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import {
  Plus,
  Edit2,
  Trash2,
  Car,
  Download,
  ArrowRight,
  CircleAlert,
} from "lucide-react";
import VehiclesSkeleton from "./VehiclesSkeleton";
import UpgradeModal from "@/components/ui/UpgradeModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import VehicleStatus from "./VehicleStatus";
import VehiclesFilterBar, { emptyVehicleFilters, VehicleFilterDraft } from "./VehiclesFilterBar";
import VehiclesTable from "./VehiclesTable";
import styles from "./vehicles.module.css";
import EmptyState from "@/components/ui/EmptyState";

interface ClientPageProps {
  initialVehicles: Vehicle[];
  total: number;
}

export default function VehiclesClientPage({
  initialVehicles,
  total: initialTotal,
}: ClientPageProps) {
  const { data: dataSession, status } = useSession();
  const userPlan = status === "authenticated" ? dataSession.user.plan : "BASIC";
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [fleetCount, setFleetCount] = useState(initialTotal);
  const [filterDraft, setFilterDraft] = useState<VehicleFilterDraft>(emptyVehicleFilters);
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
      ) as VehicleFilters;
      setFilters((current) => JSON.stringify(current) === JSON.stringify(active) ? current : active);
    }, 400);
    return () => clearTimeout(timer);
  }, [filterDraft]);

  const useInitialData = page === 1 && Object.keys(filters).length === 0 && sortColumn === "createdAt" && sortDirection === "desc";
  const { vehicles, total, isError, isLoading, mutateVehicles } =
    useFetchVehicles(page, limit, filters, sortColumn, sortDirection, useInitialData ? {
      vehicles: initialVehicles,
      total: initialTotal,
    } : undefined);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAtLimit = userPlan === "BASIC" && fleetCount >= 3;

  const handleOpenFormModal = (item: Vehicle | null = null) => {
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

  const handleSave = async (formData: WithoutBaseItem<Vehicle>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `/api/vehicles/${editingItem.id}`
      : "/api/vehicles";

    const optimisticData = editingItem
      ? vehicles.map((v) =>
          v.id === editingItem.id ? { ...v, ...formData } : v
        )
      : [
          {
            ...(formData as Vehicle),
            id: "temp-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "temp-user-id", // This will be replaced by the server response
          },
          ...vehicles,
        ];

    const options = {
      optimisticData: { vehicles: optimisticData, total },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };

    setIsSaving(true);
    handleCloseFormModal();

    try {
      await mutateVehicles(async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }
        const savedVehicle = await response.json();
        if (!editingItem) setFleetCount((count) => count + 1);
        showToast(
          `Veículo ${editingItem ? "atualizado" : "cadastrado"} com sucesso!`,
          "success"
        );
        // Replace temp-id with the real id
        const finalData = optimisticData.map((v) =>
          v.id === "temp-id" ? savedVehicle : v
        );
        return { vehicles: finalData, total: editingItem ? total : total + 1 };
      }, options);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }

    setIsSaving(false);
  };

  const handleDeleteClick = (item: Vehicle) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const optimisticData = vehicles.filter((v) => v.id !== itemToDelete.id);
    const options = {
      optimisticData: { vehicles: optimisticData, total: total - 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };

    setIsDeleting(true);
    setItemToDelete(null);

    try {
      await mutateVehicles(async () => {
        const response = await fetch(`/api/vehicles/${itemToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Falha ao excluir");
        }
        setFleetCount((count) => Math.max(0, count - 1));
        showToast("Veículo excluído com sucesso!", "success");
        return { vehicles: optimisticData, total: total - 1 };
      }, options);
    } catch {
      showToast("Falha ao excluir veículo.", "error");
    }

    setIsDeleting(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const idsToDelete = [...itemsToDelete];
    const optimisticData = vehicles.filter(
      (vehicle) => !idsToDelete.includes(vehicle.id)
    );
    const options = {
      optimisticData: {
        vehicles: optimisticData,
        total: total - idsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };

    setIsDeleting(true);
    setItemsToDelete([]);

    try {
      await mutateVehicles(async () => {
        const response = await fetch("/api/vehicles", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        if (!response.ok) throw new Error("Falha ao excluir veículos.");
        setFleetCount((count) => Math.max(0, count - idsToDelete.length));
        showToast("Veículos excluídos com sucesso!", "success");
        return {
          vehicles: optimisticData,
          total: total - idsToDelete.length,
        };
      }, options);
    } catch {
      showToast("Falha ao excluir veículos.", "error");
    }

    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/vehicles/${itemId}`);
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
      const response = await fetch("/api/export/vehicles");
      if (!response.ok) {
        throw new Error("Falha ao exportar veículos.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veiculos-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Veículos exportados com sucesso!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao exportar veículos.",
        "error"
      );
    }
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
  const showFirstRun = total === 0 && isFiltersEmpty && activeFilterCount === 0;
  const showFilters = !showFirstRun || isLoading;
  const clearFilters = () => {
    setFilterDraft({ ...emptyVehicleFilters });
    setFilters({});
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Gestão da frota</span>
          <h1>Veículos</h1>
          <p>Acompanhe a disponibilidade e os dados da sua frota.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleExportClick} className={styles.secondaryAction} disabled={fleetCount === 0} title={fleetCount === 0 ? "Cadastre um veículo para exportar o CSV" : undefined}>
            <Download size={18} aria-hidden="true" /> Exportar CSV
          </button>
          <button type="button" onClick={handleAddClick} className={styles.primaryAction}>
            <Plus size={19} aria-hidden="true" /> Adicionar veículo
          </button>
        </div>
      </header>

      {showFilters && (
        <VehiclesFilterBar
          value={filterDraft}
          onChange={setFilterDraft}
          onClear={clearFilters}
          activeCount={activeFilterCount}
        />
      )}

      {isLoading ? (
        <VehiclesSkeleton />
      ) : isError ? (
        <EmptyState Icon={CircleAlert} role="alert" title="Não foi possível carregar os veículos" description="Verifique a conexão e tente novamente." actionButton={<button type="button" onClick={() => mutateVehicles()}>Tentar novamente</button>} />
      ) : showFirstRun ? (
        <section className={styles.firstRun}>
          <div className={styles.firstRunIcon}><Car size={28} strokeWidth={1.8} aria-hidden="true" /></div>
          <div className={styles.firstRunCopy}>
            <h2>Sua frota começa aqui</h2>
            <p>Cadastre o primeiro veículo para acompanhar disponibilidade, contratos e manutenção em um só lugar.</p>
            <button type="button" className={styles.primaryAction} onClick={handleAddClick}>
              <Plus size={19} aria-hidden="true" /> Cadastrar primeiro veículo
            </button>
          </div>
          {userPlan === "BASIC" && <span className={styles.firstRunNote}>Plano Básico: até 3 veículos cadastrados.</span>}
        </section>
      ) : total === 0 ? (
        <EmptyState Icon={Car} title="Nenhum veículo encontrado" description="Altere os filtros para ver outros veículos da frota." actionButton={<button type="button" onClick={clearFilters}>Limpar filtros <ArrowRight size={17} aria-hidden="true" /></button>} />
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <h2>Frota cadastrada</h2>
            <span>{total} {total === 1 ? "veículo" : "veículos"}{!isFiltersEmpty ? " nos resultados" : ""}</span>
          </div>
          <div className={styles.desktopTable}>
            <VehiclesTable vehicles={vehicles} onOpen={handleRowClick} onEdit={handleOpenFormModal} onDelete={handleDeleteClick} onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} onBulkDelete={handleBulkDelete} />
          </div>
          <div className={styles.mobileList}>
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className={styles.mobileItem}>
                <div className={styles.mobileItemTop}>
                  <div>
                    <button type="button" className={styles.plateLink} onClick={() => handleRowClick(vehicle.id)}>{vehicle.plate}</button>
                    <p>{vehicle.brand} {vehicle.model}</p>
                  </div>
                  <VehicleStatus status={vehicle.status} />
                </div>
                <div className={styles.mobileActions}>
                  <button type="button" onClick={() => handleOpenFormModal(vehicle)}><Edit2 size={17} aria-hidden="true" /> Editar</button>
                  <button type="button" onClick={() => handleDeleteClick(vehicle)}><Trash2 size={17} aria-hidden="true" /> Excluir</button>
                </div>
              </article>
            ))}
          </div>
          <nav className={styles.pagination} aria-label="Paginação de veículos">
            <span>Mostrando {vehicles.length} de {total} veículos</span>
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
        title={editingItem ? "Editar veículo" : "Criar veículo"}
        size="4xl"
        variant="platform"
      >
        <VehicleForm
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
          itemToDelete ? "veículo" : `${itemsToDelete.length} veículos`
        }
        resourceIdentifier={itemToDelete ? itemToDelete.plate : "selecionados"}
        isDeleting={isDeleting}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        resourceName="veículos"
        monthlyPrice="R$ 49,90"
        annualPrice="R$ 499"
        annualSavings="Economize R$ 99,80"
      />
    </div>
  );
}
