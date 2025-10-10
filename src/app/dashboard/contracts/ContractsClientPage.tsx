"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Contract, Vehicle, Driver, WithoutBaseItem } from "@/types";
import { useContracts, useDrivers, useVehicles } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import ContractsSkeleton from "./ContractsSkeleton";

interface ContractsClientPageProps {
  initialContracts: Contract[];
  initialDrivers: Driver[];
  initialVehicles: Vehicle[];
}

export default function ContractsClientPage({
  initialContracts,
  initialDrivers,
  initialVehicles,
}: ContractsClientPageProps) {
  const router = useRouter();

  // Renomeando as variáveis para evitar conflitos e dar clareza
  const {
    contracts,
    isLoading: isLoadingContracts,
    isError: isErrorContracts,
    mutateContracts,
  } = useContracts(initialContracts);

  const {
    drivers,
    isLoading: isLoadingDrivers,
    isError: isErrorDrivers,
  } = useDrivers(initialDrivers);

  const {
    vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
  } = useVehicles(initialVehicles);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contract | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Contract | null>(null);

  const handleOpenFormModal = (item: Contract | null = null) => {
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
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    handleCloseFormModal();
    mutateContracts();
  };

  const handleDeleteClick = (item: Contract) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await fetch(`/api/contracts/${itemToDelete.id}`, { method: "DELETE" });
      setItemToDelete(null);
      mutateContracts();
    }
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/contracts/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const columns: Column<Contract>[] = [
    {
      header: "Motorista",
      accessor: (contract) =>
        (drivers || []).find((d) => d.id === contract.driverId)?.name || "...",
      className: "font-medium text-gray-900",
    },
    {
      header: "Veículo",
      accessor: (contract) => {
        const vehicle = (vehicles || []).find(
          (v) => v.id === contract.vehicleId
        );
        return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "...";
      },
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

  // Condição de loading unificada e correta
  const isLoading = isLoadingContracts || isLoadingDrivers || isLoadingVehicles;
  if (isLoading && (!contracts || !drivers || !vehicles)) {
    return <ContractsSkeleton />;
  }

  if (isErrorContracts || isErrorDrivers || isErrorVehicles) {
    return (
      <div className="text-center text-red-500 mt-10">
        Falha ao carregar os dados.
      </div>
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
            Novo Contrato
          </span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

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
          const driver = (drivers || []).find(
            (d) => d.id === contract.driverId
          );
          const vehicle = (vehicles || []).find(
            (v) => v.id === contract.vehicleId
          );
          return (
            <div
              key={contract.id}
              onClick={() => handleRowClick(contract.id)}
              className="bg-white rounded-lg shadow-md p-4 space-y-3 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{driver?.name}</p>
                  <p className="text-sm text-gray-500">
                    {vehicle?.plate} - {vehicle?.model}
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar Contrato" : "Novo Contrato"}
        size="4xl"
      >
        <ContractForm
          initialData={editingItem}
          vehicles={vehicles || []}
          drivers={drivers || []}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Excluir Contrato
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que quer excluir o contrato do motorista{" "}
            <span className="font-bold">
              {
                (drivers || []).find((d) => d.id === itemToDelete?.driverId)
                  ?.name
              }
            </span>
            ?
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleCloseDeleteModal}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
