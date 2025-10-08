"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Driver, WithoutBaseItem } from "@/types";
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react";
import DriverDetailsSkeleton from "./DriverDetailsSkeleton";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";

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

export default function DriverDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchDriver = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/drivers/${id}`);
      if (!res.ok) throw new Error("Motorista não encontrado");
      setDriver(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  const handleSave = async (data: WithoutBaseItem<Driver>) => {
    await fetch(`/api/drivers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setIsFormModalOpen(false);
    await fetchDriver();
  };

  const handleConfirmDelete = async () => {
    await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    router.push("/dashboard/drivers");
  };

  if (loading) return <DriverDetailsSkeleton />;
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
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                driver.status === "Ativo"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {driver.status}
            </span>
            <button
              onClick={() => setIsFormModalOpen(true)}
              title="Editar Motorista"
              className="p-2 rounded-full hover:bg-gray-100"
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
        title="Editar motorista"
        size="4xl"
      >
        <DriverForm
          initialData={driver}
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
            Excluir motorista
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que quer excluir o motorista{" "}
            <span className="font-bold">{driver.name}</span>?
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
