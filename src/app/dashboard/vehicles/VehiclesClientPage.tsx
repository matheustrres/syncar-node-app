"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Vehicle, WithoutBaseItem } from "@/types";
import { useFetchVehicles, VehicleFilters } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Hash,
  Calendar,
  Gauge,
  CheckSquare,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import VehiclesSkeleton from "./VehiclesSkeleton";
import UpgradeModal from "@/components/ui/UpgradeModal";
import AdvancedFilterBar, {
  FilterConfig,
} from "@/components/ui/AdvancedFilterBar";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";

const columns: Column<Vehicle>[] = [
  {
    header: "Placa",
    accessor: "plate",
    className: "font-medium text-gray-900",
    sortable: true,
  },
  {
    header: "Marca",
    accessor: "brand",
    sortable: true,
  },
  {
    header: "Modelo",
    accessor: "model",
    sortable: true,
  },
  {
    header: "Status",
    accessor: (vehicle) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          vehicle.status === "Disponível"
            ? "bg-green-100 text-green-800"
            : vehicle.status === "Manutenção"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
        }`}
      >
        {vehicle.status}
      </span>
    ),
    sortable: true,
  },
];

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "Disponível", label: "Disponível" },
  { value: "Alugado", label: "Alugado" },
  { value: "Manutenção", label: "Manutenção" },
];

interface ClientPageProps {
  initialVehicles: Vehicle[];
  total: number;
  userPlan: string;
}

const filtersConfig: FilterConfig[] = [
  {
    id: "searchPlate",
    label: "Buscar por placa",
    type: "text",
    field: "plate",
    placeholder: "Ex: ABC1234",
    icon: Hash,
  },
  {
    id: "searchBrand",
    label: "Buscar por marca",
    type: "text",
    field: "brand",
    placeholder: "Ex: Toyota",
    icon: Car,
  },
  {
    id: "searchModel",
    label: "Buscar por modelo",
    type: "text",
    field: "model",
    placeholder: "Ex: Corolla",
    icon: Car,
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    field: "status",
    options: statusOptions,
    placeholder: "Todos os status",
    icon: CheckSquare,
  },
  {
    id: "yearRange",
    label: "Ano",
    type: "number-range",
    field: "year",
    icon: Calendar,
  },
  {
    id: "kmRange",
    label: "Quilometragem",
    type: "number-range",
    field: "km",
    icon: Gauge,
  },
];

export default function VehiclesClientPage({
  initialVehicles,
  total: initialTotal,
  userPlan,
}: ClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { vehicles, total, isError, isLoading, mutateVehicles } =
    useFetchVehicles(page, limit, filters, sortColumn, sortDirection, {
      vehicles: initialVehicles,
      total: initialTotal,
    });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAtLimit = userPlan === "BASIC" && total >= 3;

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
        showToast("Veículo excluído com sucesso!", "success");
        return { vehicles: optimisticData, total: total - 1 };
      }, options);
    } catch {
      showToast("Falha ao excluir veículo.", "error");
    }

    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/vehicles/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const totalPages = Math.ceil(total / limit);

  const addButton = (
    <button
      onClick={handleAddClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
    >
      <Plus size={20} />
      <span>Adicionar veículo</span>
    </button>
  );

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const isFiltersEmpty = Object.keys(filters).length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Veículos
        </h2>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Adicionar veículo
          </span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      <AdvancedFilterBar
        filtersConfig={filtersConfig}
        onFilterChange={setFilters}
      />

      {isLoading ? (
        <VehiclesSkeleton />
      ) : isError ? (
        <ErrorDisplay
          errorMessage="Falha ao carregar os veículos."
          onRetry={mutateVehicles}
        />
      ) : total === 0 && isFiltersEmpty ? (
        <>
          <EmptyState
            Icon={Car}
            title="Nenhum veículo cadastrado"
            description="Comece cadastrando o primeiro veículo da sua frota para poder gerenciá-los."
            actionButton={addButton}
          />
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            title={editingItem ? "Editar veículo" : "Adicionar veículo"}
            size="4xl"
          >
            <VehicleForm
              initialData={editingItem}
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
              data={vehicles || []}
              onRowClick={handleRowClick}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteClick}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          </div>

          <div className="lg:hidden grid grid-cols-1 gap-4">
            {(vehicles || []).map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleRowClick(vehicle.id)}
                className="bg-white rounded-lg shadow-md p-4 space-y-3 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{vehicle.plate}</p>
                    <p className="text-sm text-gray-500">{vehicle.brand}</p>
                    <p className="text-sm text-gray-500">{vehicle.model}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      vehicle.status === "Disponível"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "Manutenção"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div
                  className="border-t pt-2 flex justify-end items-center"
                  onClick={handleActionClick}
                >
                  <div className="flex gap-2">
                    <button
                      title="Editar Veículo"
                      onClick={() => handleOpenFormModal(vehicle)}
                      className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir Veículo"
                      onClick={() => handleDeleteClick(vehicle)}
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
              Mostrando {vehicles.length} de {total} veículos.
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
        title={editingItem ? "Editar veículo" : "Adicionar veículo"}
        size="4xl"
      >
        <VehicleForm
          initialData={editingItem}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        resourceName="veículo"
        resourceIdentifier={itemToDelete?.plate}
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
