"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, WithoutBaseItem } from "@/types";
import { useFetchVehicleById } from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import VehicleDetailsSkeleton from "./VehicleDetailsSkeleton";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="py-2">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-900">{value}</p>
  </div>
);

interface ClientPageProps {
  id: string;
  initialVehicle: Vehicle;
}

export default function VehicleDetailClientPage({
  id,
  initialVehicle,
}: ClientPageProps) {
  const router = useRouter();

  const {
    data: vehicle,
    isError,
    mutate: mutateVehicle,
  } = useFetchVehicleById(id, initialVehicle);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSave = async (formData: WithoutBaseItem<Vehicle>) => {
    setIsSaving(true);
    setFormApiError(null);

    const response = await fetch(`/api/vehicles/${vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      setFormApiError(error);
      setIsSaving(false);
      return;
    }

    const updatedVehicle = { ...vehicle, ...formData } as Vehicle;

    mutate(updatedVehicle, false);
    setIsSaving(false);
    handleCloseFormModal();
  };

  const handleConfirmDelete = async () => {
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    router.push("/dashboard/vehicles");
  };

  if (!vehicle && !isError) return <VehicleDetailsSkeleton />;
  if (isError) return <div>Falha ao carregar dados do veículo.</div>;
  if (!vehicle) return <div>Veículo não encontrado.</div>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Voltar para a lista de veículos
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="text-lg text-gray-600">{vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar Veículo"
              className="p-2 rounded-full text-indigo-600 hover:bg-gray-100"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir veículo"
              className="p-2 rounded-full hover:bg-gray-100 text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Detalhes do veículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem label="Marca" value={vehicle.brand} />
            <DetailItem label="Modelo" value={vehicle.model} />
            <DetailItem label="Placa" value={vehicle.plate} />
            <DetailItem label="Ano" value={vehicle.year} />
            <DetailItem label="Cor" value={vehicle.color} />
            <DetailItem
              label="Quilometragem"
              value={`${vehicle.km.toLocaleString("pt-BR")} km`}
            />
            <DetailItem label="RENAVAM" value={vehicle.renavam} />
            <DetailItem label="Chassi" value={vehicle.chassis} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar Veículo"
        size="4xl"
      >
        <VehicleForm
          initialData={vehicle}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Excluir veículo
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que quer excluir o veículo{" "}
            <span className="font-bold">{vehicle.plate}</span>?
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
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
