"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/types";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import VehiclesSkeleton from "./VehiclesSkeleton";

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Falha ao buscar dados dos veículos.");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenFormModal = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(false);
  };

  const handleSave = async (
    data: Omit<Vehicle, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const method = editingVehicle ? "PUT" : "POST";
    const url = editingVehicle
      ? `/api/vehicles/${editingVehicle.id}`
      : "/api/vehicles";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    handleCloseFormModal();
    await fetchVehicles();
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      await fetch(`/api/vehicles/${vehicleToDelete.id}`, { method: "DELETE" });
      setVehicleToDelete(null);
      await fetchVehicles();
    }
  };

  const handleRowClick = (vehicleId: string) => {
    router.push(`/dashboard/vehicles/${vehicleId}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (loading) return <VehiclesSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Veículos
        </h2>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span className="hidden sm:inline whitespace-nowrap">
            Adicionar veículo
          </span>
        </button>
      </div>

      {/* Layout de Tabela para Telas Grandes (lg e acima) */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                onClick={() => handleRowClick(vehicle.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vehicle.brand} {vehicle.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  onClick={handleActionClick}
                >
                  <button
                    title="Editar veículo"
                    onClick={() => handleOpenFormModal(vehicle)}
                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    title="Excluir veículo"
                    onClick={() => handleDeleteClick(vehicle)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Layout de Cartões para Telas Pequenas (abaixo de lg) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => handleRowClick(vehicle.id)}
            className="bg-white rounded-lg shadow-md p-4 space-y-3"
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingVehicle ? "Editar veículo" : "Adicionar veículo"}
        size="4xl"
      >
        <VehicleForm
          initialData={editingVehicle}
          onSave={handleSave}
          onCancel={handleCloseFormModal}
        />
      </Modal>

      <Modal
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        title="Confirmar exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">
            Excluir vículo
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Você tem certeza que deseja excluir o veículo{" "}
              <span className="font-bold">{vehicleToDelete?.plate}</span>? Esta
              ação não poderá ser desfeita.
            </p>
          </div>
          <div className="items-center px-4 py-3 gap-4 flex justify-center">
            <button
              onClick={() => setVehicleToDelete(null)}
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
