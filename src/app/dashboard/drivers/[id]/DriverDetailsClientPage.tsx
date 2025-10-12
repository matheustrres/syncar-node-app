"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Driver, WithoutBaseItem } from "@/types";
import { useFetchDriverById } from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import DriverDetailsSkeleton from "./DriverDetailsSkeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

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
  initialDriver: Driver;
}

export default function DriverDetailsClientPage({
  id,
  initialDriver,
}: ClientPageProps) {
  const router = useRouter();

  const {
    data: driver,
    isError,
    mutate: mutateDriver,
  } = useFetchDriverById(id, initialDriver);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formApiError, setFormApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (data: WithoutBaseItem<Driver>) => {
    setIsSaving(true);
    setFormApiError(null);
    const response = await fetch(`/api/drivers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const { error } = await response.json();
      setFormApiError(error);
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    setIsFormModalOpen(false);
    mutateDriver();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    router.push("/dashboard/drivers");
  };

  if (isError) {
    return (
      <ErrorDisplay
        errorMessage="Falha ao carregar dados do motorista."
        onRetry={mutateDriver}
      />
    );
  }

  if (!driver && !isError) return <DriverDetailsSkeleton />;
  if (!driver) return <div>Motorista não encontrado.</div>;

  const fullAddress = [
    driver.logradouro,
    driver.numero,
    driver.complemento,
    driver.bairro,
    driver.cidade,
    driver.uf,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Voltar para a lista de motoristas
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{driver.name}</h2>
            <p className="text-lg text-gray-600">CPF: {driver.cpf}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${driver.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {driver.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar Motorista"
              className="p-2 rounded-full hover:bg-gray-100 text-indigo-600"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir motorista"
              className="p-2 rounded-full hover:bg-gray-100 text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Detalhes do Motorista
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem label="Nome Completo" value={driver.name} />
            <DetailItem label="CPF" value={driver.cpf} />
            <DetailItem label="Telefone" value={driver.phone} />
            <DetailItem label="Email" value={driver.email} />
            <DetailItem label="CNH" value={driver.cnh} />
            <DetailItem
              label="Validade da CNH"
              value={new Date(driver.cnhValidity).toLocaleDateString("pt-BR")}
            />
            {fullAddress && (
              <div className="md:col-span-2 lg:col-span-3">
                <DetailItem label="Endereço" value={fullAddress} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Editar Motorista"
        size="4xl"
      >
        <DriverForm
          initialData={driver}
          apiError={formApiError}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resourceName="motorista"
        resourceIdentifier={driver.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
