"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Vehicle, WithoutBaseItem } from "@/types";
import { useFetchVehicleById } from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";
import VehicleDetailsSkeleton from "./VehicleDetailsSkeleton";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

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

export default function VehicleDetailsClientPage({
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
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (formData: WithoutBaseItem<Vehicle>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      const updatedVehicle = { ...vehicle, ...formData } as Vehicle;
      mutateVehicle(updatedVehicle, false);
      showToast("Veículo atualizado com sucesso!", "success");
      setIsFormModalOpen(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSaving(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      showToast("Veículo excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/vehicles");
    } catch {
      showToast("Falha ao excluir veículo.", "error");
    }
    setIsDeleting(false);
  };

  if (isError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar dados do veículo."
        onRetry={mutateVehicle}
      />
    );
  }

  if (!vehicle && !isError) return <VehicleDetailsSkeleton />;
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
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resourceName="veículo"
        resourceIdentifier={vehicle.plate}
        isDeleting={isDeleting}
      />
    </div>
  );
}
