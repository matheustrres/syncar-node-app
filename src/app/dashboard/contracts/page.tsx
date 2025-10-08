"use client";

import { useState, useEffect } from "react";
import { Contract, Vehicle, Driver } from "@/types";
import Modal from "@/components/ui/Modal";
import ContractForm from "@/components/forms/ContractForm";
import { Plus, AlertTriangle } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import DataTable, { Column } from "@/components/ui/DataTable";
import ContractsSkeleton from "./ContractsSkeleton";

export default function ContractsPage() {
  const {
    data: contracts,
    loading: loadingContracts,
    isFormModalOpen,
    editingItem,
    itemToDelete,
    handleOpenFormModal,
    handleCloseFormModal,
    handleSave,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleRowClick,
  } = useCrud<Contract>("/api/contracts");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/drivers"),
        ]);
        setVehicles(await vehiclesRes.json());
        setDrivers(await driversRes.json());
      } catch (error) {
        console.error("Falha ao buscar dados relacionados:", error);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelatedData();
  }, []);

  const columns: Column<Contract>[] = [
    {
      header: "Motorista",
      accessor: (contract) =>
        drivers.find((d) => d.id === contract.driverId)?.name || "...",
      className: "font-medium text-gray-900",
    },
    {
      header: "Veículo",
      accessor: (contract) => {
        const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
        return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "...";
      },
    },
    {
      header: "Valor semanal",
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

  const isLoading = loadingContracts || loadingRelated;

  if (isLoading) return <ContractsSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Contratos</h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Novo contrato
        </button>
      </div>

      <DataTable
        columns={columns}
        data={contracts}
        onRowClick={handleRowClick}
        onEdit={handleOpenFormModal}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar contrato" : "Novo contrato"}
        size="4xl"
      >
        <ContractForm
          initialData={editingItem}
          vehicles={vehicles}
          drivers={drivers}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        title="Confirmar exclusão"
        size="md"
      >
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Excluir contrato
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que quer excluir o contrato do motorista{" "}
            <span className="font-bold">
              {drivers.find((d) => d.id === itemToDelete?.driverId)?.name}
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
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
