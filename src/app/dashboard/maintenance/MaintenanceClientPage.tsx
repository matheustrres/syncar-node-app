"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Maintenance, Vehicle, WithoutBaseItem } from "@/types";
import {
  useFetchMaintenance,
  useAllVehicles,
  MaintenanceWithRelations,
} from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import MaintenanceForm from "@/components/forms/MaintenanceForm";
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Wrench,
  Calendar,
  DollarSign,
  Gauge,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import MaintenanceSkeleton from "./MaintenanceSkeleton";
import AdvancedFilterBar, {
  FilterConfig,
} from "@/components/ui/AdvancedFilterBar";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";
import UpgradeModal from "@/components/ui/UpgradeModal";
import useCrud from "@/hooks/useCrud";

const columns: Column<MaintenanceWithRelations>[] = [
  {
    header: "Veículo",
    accessor: (maintenance) =>
      `${maintenance.vehicle.plate} - ${maintenance.vehicle.model}`,
    className: "font-medium text-gray-900",
    sortable: true,
  },
  {
    header: "Tipo",
    accessor: "type",
    sortable: true,
  },
  {
    header: "Descrição",
    accessor: "description",
    sortable: true,
  },
  {
    header: "Custo",
    accessor: (maintenance) => `R$ ${maintenance.cost.toFixed(2)}`,
    sortable: true,
  },
  {
    header: "Data",
    accessor: (maintenance) =>
      new Date(maintenance.date).toLocaleDateString("pt-BR"),
    sortable: true,
  },
  {
    header: "KM",
    accessor: "mileage",
    sortable: true,
  },
];

const maintenanceTypeOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "PREVENTIVA", label: "Preventiva" },
  { value: "CORRETIVA", label: "Corretiva" },
  { value: "TROCA_OLEO", label: "Troca de Óleo" },
  { value: "PNEUS", label: "Pneus" },
  { value: "FREIOS", label: "Freios" },
  { value: "OUTROS", label: "Outros" },
];

const filtersConfig: FilterConfig[] = [
  {
    id: "searchVehicle",
    label: "Buscar por veículo",
    type: "text",
    field: "vehicle",
    placeholder: "Ex: ABC1234 ou Corolla",
    icon: Car,
  },
  {
    id: "type",
    label: "Tipo de Manutenção",
    type: "select",
    field: "type",
    options: maintenanceTypeOptions,
    placeholder: "Todos os tipos",
    icon: Wrench,
  },
  {
    id: "costRange",
    label: "Custo",
    type: "number-range",
    field: "cost",
    icon: DollarSign,
  },
  {
    id: "dateRange",
    label: "Data",
    type: "date-range",
    field: "date",
    icon: Calendar,
  },
  {
    id: "mileageRange",
    label: "Quilometragem",
    type: "number-range",
    field: "mileage",
    icon: Gauge,
  },
];

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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { maintenance, total, isLoading, isError, mutateMaintenance } =
    useFetchMaintenance(page, limit, filters, sortColumn, sortDirection, {
      maintenance: initialMaintenance,
      total: initialTotal,
    });

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

  const { deleteMany: deleteManyMaintenance } =
    useCrud<Maintenance>("/api/maintenance");

  const handleOpenFormModal = (
    item: MaintenanceWithRelations | null = null
  ) => {
    if (userPlan === "BASIC" && total >= 3 && !item) {
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
    const optimisticData = maintenance.filter(
      (m) => !itemsToDelete.includes(m.id)
    );
    const options = {
      optimisticData: {
        maintenance: optimisticData,
        total: total - itemsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemsToDelete([]);
    try {
      await mutateMaintenance(async () => {
        await deleteManyMaintenance(itemsToDelete);
        showToast("Manutenções excluídas com sucesso!", "success");
        return {
          maintenance: optimisticData,
          total: total - itemsToDelete.length,
        };
      }, options);
    } catch {
      showToast("Falha ao excluir manutenções.", "error");
    }
    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    // router.push(`/dashboard/maintenance/${itemId}`); // No detail page for now
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const totalPages = Math.ceil(total / limit);

  const addButton = (
    <button
      onClick={() => handleOpenFormModal()}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
    >
      <Plus size={20} />
      <span>Nova manutenção</span>
    </button>
  );

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const isFiltersEmpty = Object.keys(filters).length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Manutenções
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Nova manutenção
          </span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      <AdvancedFilterBar
        filtersConfig={filtersConfig}
        onFilterChange={setFilters}
      />

      {isLoading ? (
        <MaintenanceSkeleton />
      ) : isError ? (
        <ErrorDisplay
          errorMessage="Falha ao carregar as manutenções."
          onRetry={mutateMaintenance}
        />
      ) : total === 0 && isFiltersEmpty ? (
        <>
          <EmptyState
            Icon={Wrench}
            title="Nenhuma manutenção cadastrada"
            description="Comece cadastrando a primeira manutenção para poder gerenciá-las."
            actionButton={addButton}
          />

          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            title={editingItem ? "Editar Manutenção" : "Nova Manutenção"}
            size="4xl"
          >
            <MaintenanceForm
              initialData={editingItem}
              vehicles={allVehicles || []}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={handleCloseFormModal}
            />
          </Modal>
        </>
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={maintenance || []}
              onRowClick={handleRowClick}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onBulkDelete={handleBulkDelete}
            />
          </div>

          <div className="lg:hidden grid grid-cols-1 gap-4">
            {(maintenance || []).map((item) => (
              <div
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                className="bg-white rounded-lg shadow-md p-4 space-y-3 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">
                      {item.vehicle.plate} - {item.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500">Tipo: {item.type}</p>
                    <p className="text-sm text-gray-500">
                      Custo: R$ {item.cost.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(item.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={handleActionClick}>
                    <button
                      title="Editar Manutenção"
                      onClick={() => handleOpenFormModal(item)}
                      className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir Manutenção"
                      onClick={() => handleDeleteClick(item)}
                      className="text-red-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {maintenance.length} de {total} manutenções.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || total === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar Manutenção" : "Nova Manutenção"}
        size="4xl"
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
