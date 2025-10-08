"use client";

import { Vehicle } from "@/types";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import { Plus, AlertTriangle } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import DataTable, { Column } from "@/components/ui/DataTable";
import VehiclesSkeleton from "./VehiclesSkeleton";

const columns: Column<Vehicle>[] = [
  {
    header: "Placa",
    accessor: "plate",
    className: "font-medium text-gray-900",
  },
  {
    header: "Modelo",
    accessor: (vehicle) => `${vehicle.brand} ${vehicle.model}`,
  },
  {
    header: "Status",
    accessor: (vehicle) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          vehicle.status === "Alugado"
            ? "bg-green-100 text-green-800"
            : vehicle.status === "Manutenção"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
        }`}
      >
        {vehicle.status}
      </span>
    ),
  },
];

export default function VehiclesPage() {
  const {
    data: vehicles,
    loading,
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
  } = useCrud<Vehicle>("/api/vehicles");

  if (loading) return <VehiclesSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Veículos</h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Adicionar veículo
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        onRowClick={handleRowClick}
        onEdit={handleOpenFormModal}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingItem ? "Editar veículo" : "Adicionar veículo"}
        size="4xl"
      >
        <VehicleForm
          initialData={editingItem}
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir Veículo
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Você tem certeza que deseja excluir o veículo{" "}
              <span className="font-bold">{itemToDelete?.plate}</span>? Esta
              ação não poderá ser desfeita.
            </p>
          </div>
          <div className="items-center px-4 py-3 gap-4 flex justify-center">
            <button
              onClick={handleCloseDeleteModal}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
