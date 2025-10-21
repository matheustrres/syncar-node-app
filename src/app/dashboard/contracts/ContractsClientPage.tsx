"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useSWRConfig } from "swr";
import { Contract, Vehicle, Driver, WithoutBaseItem } from "@/types";
import {
  useFetchContracts,
  useAllDrivers,
  useAllVehicles,
  ContractWithRelations,
  ContractFilters,
} from "@/hooks/useData";
import useCrud from "@/hooks/useCrud";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  User,
  Car,
  Hash,
  DollarSign,
  Calendar,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import ContractsSkeleton from "./ContractsSkeleton";
import AdvancedFilterBar, {
  FilterConfig,
} from "@/components/ui/AdvancedFilterBar";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import EmptyState from "@/components/ui/EmptyState";

interface ContractsClientPageProps {
  initialContracts: ContractWithRelations[];
  total: number;
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
}

const columns: Column<ContractWithRelations>[] = [
  {
    header: "Motorista",
    accessor: (contract) => contract.driver.name,
    className: "font-medium text-gray-900",
    sortable: true,
  },
  {
    header: "Placa",
    accessor: (contract) => contract.vehicle.plate,
    sortable: true,
  },
  {
    header: "Modelo",
    accessor: (contract) => contract.vehicle.model,
    sortable: true,
  },
  {
    header: "Valor Semanal",
    accessor: (contract) => `R$ ${contract.weeklyValue.toFixed(2)}`,
    sortable: true,
  },
  {
    header: "Duração (semanas)",
    accessor: (contract) => contract.duration,
    sortable: true,
  },
  {
    header: "Status",
    accessor: (contract) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          contract.status === "Ativo"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {contract.status}
      </span>
    ),
    sortable: true,
  },
];

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "Ativo", label: "Ativo" },
  { value: "Finalizado", label: "Finalizado" },
];

const filtersConfig: FilterConfig[] = [
  {
    id: "searchDriverName",
    label: "Buscar por motorista",
    type: "text",
    field: "driverName",
    placeholder: "Ex: João Silva",
    icon: User,
  },
  {
    id: "searchVehiclePlate",
    label: "Buscar por placa",
    type: "text",
    field: "vehiclePlate",
    placeholder: "Ex: ABC1234",
    icon: Car,
  },
  {
    id: "searchVehicleModel",
    label: "Buscar por modelo",
    type: "text",
    field: "vehicleModel",
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
    icon: Hash,
  },
  {
    id: "weeklyValueRange",
    label: "Valor Semanal",
    type: "number-range",
    field: "weeklyValue",
    icon: DollarSign,
  },
  {
    id: "startDateRange",
    label: "Data de Início",
    type: "date-range",
    field: "startDate",
    icon: Calendar,
  },
];

export default function ContractsClientPage({
  initialContracts,
  total: initialTotal,
  initialDrivers,
  initialVehicles,
}: ContractsClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContractFilters>({});
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { contracts, total, isLoading, isError, mutateContracts } =
    useFetchContracts(page, limit, filters, sortColumn, sortDirection, {
      contracts: initialContracts,
      total: initialTotal,
    });

  const { drivers: allDrivers } = useAllDrivers(initialDrivers);
  const { vehicles: allVehicles } = useAllVehicles(initialVehicles);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContractWithRelations | null>(
    null
  );
  const [itemToDelete, setItemToDelete] =
    useState<ContractWithRelations | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { deleteMany: deleteManyContracts } =
    useCrud<Contract>("/api/contracts");

  const handleOpenFormModal = (item: ContractWithRelations | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (formData: WithoutBaseItem<Contract>) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `/api/contracts/${editingItem.id}`
      : "/api/contracts";
    // Find driver and vehicle names for optimistic update
    const driverName =
      allDrivers.find((d) => d.id === formData.driverId)?.name || "";
    const vehicleInfo = allVehicles.find((v) => v.id === formData.vehicleId);
    const optimisticData = editingItem
      ? contracts.map((c) =>
          c.id === editingItem.id
            ? {
                ...c,
                ...formData,
                driver: { name: driverName },
                vehicle: {
                  plate: vehicleInfo?.plate || "",
                  model: vehicleInfo?.model || "",
                },
              }
            : c
        )
      : [
          {
            ...(formData as Contract),
            id: "temp-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "temp-user-id", // This will be replaced by the server response
            driver: { name: driverName },
            vehicle: {
              plate: vehicleInfo?.plate || "",
              model: vehicleInfo?.model || "",
            },
            status: "Ativo",
          },
          ...contracts,
        ];
    const options = {
      optimisticData: { contracts: optimisticData, total },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsSaving(true);
    handleCloseFormModal();
    try {
      await mutateContracts(async () => {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }
        const savedContract = await response.json();
        showToast(
          `Contrato ${editingItem ? "atualizado" : "cadastrado"} com sucesso!`,
          "success"
        );
        // Replace temp-id with the real id
        const finalData = optimisticData.map((c) =>
          c.id === "temp-id" ? savedContract : c
        );
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/vehicles")
        );
        return {
          contracts: finalData,
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

  const handleDeleteClick = (item: ContractWithRelations) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const optimisticData = contracts.filter((c) => c.id !== itemToDelete.id);
    const options = {
      optimisticData: { contracts: optimisticData, total: total - 1 },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };

    setIsDeleting(true);
    setItemToDelete(null);

    try {
      await mutateContracts(async () => {
        const response = await fetch(`/api/contracts/${itemToDelete.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Falha ao excluir");
        }
        showToast("Contrato excluído com sucesso!", "success");
        return { contracts: optimisticData, total: total - 1 };
      }, options);
    } catch {
      showToast("Falha ao excluir contrato.", "error");
    }

    setIsDeleting(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    setItemsToDelete(ids);
  };

  const handleConfirmBulkDelete = async () => {
    const optimisticData = contracts.filter(
      (contract) => !itemsToDelete.includes(contract.id)
    );
    const options = {
      optimisticData: {
        contracts: optimisticData,
        total: total - itemsToDelete.length,
      },
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };
    setIsDeleting(true);
    setItemsToDelete([]);
    try {
      await mutateContracts(async () => {
        await deleteManyContracts(itemsToDelete);
        showToast("Contratos excluídos com sucesso!", "success");
        return {
          contracts: optimisticData,
          total: total - itemsToDelete.length,
        };
      }, options);
    } catch {
      showToast("Falha ao excluir contratos.", "error");
    }
    setIsDeleting(false);
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/contracts/${itemId}`);
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
      <span>Novo contrato</span>
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
          Contratos
        </h2>

        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={20} />

          <span className="hidden sm:inline whitespace-nowrap">
            Novo contrato
          </span>

          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      <AdvancedFilterBar
        filtersConfig={filtersConfig}
        onFilterChange={setFilters}
      />

      {isLoading ? (
        <ContractsSkeleton />
      ) : isError ? (
        <ErrorDisplay
          errorMessage="Falha ao carregar os dados."
          onRetry={mutateContracts}
        />
      ) : total === 0 && isFiltersEmpty ? (
        <>
          <EmptyState
            Icon={FileText}
            title="Nenhum contrato cadastrado"
            description="Comece cadastrando o primeiro contrato para poder gerenciá-los."
            actionButton={addButton}
          />

          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            title={editingItem ? "Editar contrato" : "Novo contrato"}
            size="4xl"
          >
            <ContractForm
              initialData={editingItem}
              vehicles={allVehicles || []}
              drivers={allDrivers || []}
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
              data={contracts || []}
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
            {(contracts || []).map((contract) => {
              return (
                <div
                  key={contract.id}
                  onClick={() => handleRowClick(contract.id)}
                  className="bg-white rounded-lg shadow-md p-4 space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">
                        {contract.driver.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {contract.vehicle.plate}
                      </p>

                      <p className="text-sm text-gray-500">
                        {contract.vehicle.model}
                      </p>
                      {contract.duration && (
                        <p className="text-sm text-gray-500">
                          Duração: {contract.duration} semanas
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        contract.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between items-center">
                    <p className="font-semibold text-green-600">
                      R$ {contract.weeklyValue.toFixed(2)}
                      <span className="font-normal text-sm text-gray-500">
                        /semana
                      </span>
                    </p>

                    <div className="flex gap-2" onClick={handleActionClick}>
                      <button
                        title="Editar Contrato"
                        onClick={() => handleOpenFormModal(contract)}
                        className="text-indigo-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        title="Excluir Contrato"
                        onClick={() => handleDeleteClick(contract)}
                        className="text-red-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {contracts.length} de {total} contratos.
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
        title={editingItem ? "Editar contrato" : "Novo contrato"}
        size="4xl"
      >
        <ContractForm
          initialData={editingItem}
          vehicles={allVehicles || []}
          drivers={allDrivers || []}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete || itemsToDelete.length > 0}
        onClose={handleCloseDeleteModal}
        onConfirm={itemToDelete ? handleConfirmDelete : handleConfirmBulkDelete}
        resourceName={
          itemToDelete ? "contrato" : `${itemsToDelete.length} contratos`
        }
        resourceIdentifier={
          itemToDelete
            ? `do motorista ${itemToDelete?.driver.name}`
            : "selecionados"
        }
        isDeleting={isDeleting}
      />
    </div>
  );
}
