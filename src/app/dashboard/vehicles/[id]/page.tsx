"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vehicle } from "@/types";
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react";
import VehicleDetailsSkeleton from "./VehicleDetailsSkeleton";
import Modal from "@/components/ui/Modal";
import VehicleForm from "@/components/forms/VehicleForm";

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

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      if (!res.ok) throw new Error("Veículo não encontrado");
      setVehicle(await res.json());
    } catch (error) {
      console.error(error);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleSave = async (data: Omit<Vehicle, "id" | "userId">) => {
    await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setIsFormModalOpen(false);
    await fetchVehicle();
  };

  const handleConfirmDelete = async () => {
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    router.push("/dashboard/vehicles");
  };

  if (loading) return <VehicleDetailsSkeleton />;
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
          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                vehicle.status === "Alugado"
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
              title="Editar veículo"
              className="p-2 rounded-full hover:bg-gray-100"
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

      {/* Modais */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar veículo"
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
        title="Confirmar exclusão"
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
