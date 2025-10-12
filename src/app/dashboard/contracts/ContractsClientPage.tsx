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
} from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import ContractsSkeleton from "./ContractsSkeleton";
import FilterBar from "@/components/ui/FilterBar";
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
  },
  {
    header: "Veículo",
    accessor: (contract) =>
      `${contract.vehicle.plate} - ${contract.vehicle.model}`,
  },
  {
    header: "Valor Semanal",
    accessor: (contract) => `R$ ${contract.weeklyValue.toFixed(2)}`,
    className: "font-semibold text-green-600",
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
  },
];

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "Ativo", label: "Ativo" },
  { value: "Finalizado", label: "Finalizado" },
];

export default function ContractsClientPage({
  initialContracts,
  total: initialTotal,
  initialDrivers,
  initialVehicles,
}: ContractsClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const { contracts, total, isLoading, isError, mutateContracts } =
    useFetchContracts(page, limit, searchTerm, statusFilter, {
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
  const { showToast } = useToast();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenFormModal = (item: ContractWithRelations | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (formData: WithoutBaseItem<Contract>) => {
    setIsSaving(true);
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `/api/contracts/${editingItem.id}`
      : "/api/contracts";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast(
        `Contrato ${editingItem ? "atualizado" : "cadastrado"} com sucesso!`,
        "success"
      );
      handleCloseFormModal();
      mutateContracts();
      mutate((key) => typeof key === "string" && key.startsWith("/api/vehicles"));
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
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsDeleting(true);
      try {
        await fetch(`/api/contracts/${itemToDelete.id}`, { method: "DELETE" });
        showToast("Contrato excluído com sucesso!", "success");
        setItemToDelete(null);
        mutateContracts();
      } catch {
        showToast("Falha ao excluir contrato.", "error");
      }
      setIsDeleting(false);
    }
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/contracts/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) return <ContractsSkeleton />;

  if (isError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar os dados."
        onRetry={mutateContracts}
      />
    );
  }

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

  if (total === 0 && !isLoading && !isError && !searchTerm && !statusFilter) {
    return (
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
    );
  }

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

      <FilterBar
        searchPlaceholder="Buscar por motorista ou placa..."
        filterOptions={statusOptions}
        onSearchChange={setSearchTerm}
        onFilterChange={setStatusFilter}
      />

      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={contracts || []}
          onRowClick={handleRowClick}
          onEdit={handleOpenFormModal}
          onDelete={handleDeleteClick}
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
                    {contract.vehicle.plate} - {contract.vehicle.model}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
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
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        resourceName="contrato"
        resourceIdentifier={`do motorista ${itemToDelete?.driver.name}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
