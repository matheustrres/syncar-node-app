"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, WithoutBaseItem } from "@/types";
import { useFetchVehicles } from "@/hooks/useData";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
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

interface ClientPageProps {
  initialVehicles: Vehicle[];
  total: number;
}

export default function VehiclesClientPage({
  initialVehicles,
  total: initialTotal,
}: ClientPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { vehicles, total, isError, isLoading, mutateVehicles } = useFetchVehicles(
    page,
    limit,
    { vehicles: initialVehicles, total: initialTotal }
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);

  const handleOpenFormModal = (item: Vehicle | null = null) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
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
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    handleCloseFormModal();
    mutateVehicles();
  };

  const handleDeleteClick = (item: Vehicle) => {
    setItemToDelete(item);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await fetch(`/api/vehicles/${itemToDelete.id}`, { method: "DELETE" });
      setItemToDelete(null);
      mutateVehicles();
    }
  };

  const handleRowClick = (itemId: string) => {
    router.push(`/dashboard/vehicles/${itemId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) return <VehiclesSkeleton />;

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Falha ao carregar os veículos.
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Veículos
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Adicionar veículo
          </span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={vehicles || []}
          onRowClick={handleRowClick}
          onEdit={handleOpenFormModal}
          onDelete={handleDeleteClick}
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
                <p className="text-sm text-gray-500">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  vehicle.status === "Alugado"
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
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir veículo
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Você tem certeza que deseja excluir o veículo{" "}
              <span className="font-bold">{itemToDelete?.plate}</span>? Esta
              ação não pode ser desfeita.
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
