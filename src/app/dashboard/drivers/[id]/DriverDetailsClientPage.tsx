"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { Driver, Payment, WithoutBaseItem } from "@/types";
import {
  useFetchDriverById,
  useFetchDriverPayments,
  useAllVehicles,
  useAllDrivers,
  useAllContracts,
} from "@/hooks/useData";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DriverForm from "@/components/forms/DriverForm";
import DriverDetailsSkeleton from "./DriverDetailsSkeleton";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PaymentWithRelations } from "@/hooks/useData";
import DataTableSkeleton from "@/components/ui/DataTableSkeleton";
import PaymentForm from "@/components/forms/PaymentForm";
import UpgradePlaceholder from "@/components/ui/UpgradePlaceholder";

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
  const { data: session } = useSession();
  const {
    data: driver,
    isError,
    mutate: mutateDriver,
  } = useFetchDriverById(id, initialDriver);
  const {
    payments,
    isLoading: isLoadingPayments,
    mutate: mutatePayments,
  } = useFetchDriverPayments(id);
  const { vehicles } = useAllVehicles();
  const { drivers } = useAllDrivers();
  const { contracts } = useAllContracts();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPaymentFormModalOpen, setIsPaymentFormModalOpen] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [, setIsSavingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  const handleOpenEditPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentFormModalOpen(true);
  };

  const handleOpenDeletePaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeletePaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData: WithoutBaseItem<Payment>) => {
    if (!selectedPayment) return;
    setIsSavingPayment(true);
    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Pagamento atualizado com sucesso!", "success");
      setIsPaymentFormModalOpen(false);
      mutatePayments();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Ocorreu um erro",
        "error"
      );
    }
    setIsSavingPayment(false);
  };

  const handleConfirmDeletePayment = async () => {
    if (!selectedPayment) return;
    setIsDeletingPayment(true);
    try {
      await fetch(`/api/payments/${selectedPayment.id}`, { method: "DELETE" });
      showToast("Pagamento excluído com sucesso!", "success");
      setIsDeletePaymentModalOpen(false);
      mutatePayments();
    } catch {
      showToast("Falha ao excluir pagamento.", "error");
    }
    setIsDeletingPayment(false);
  };

  const paymentColumns: Column<PaymentWithRelations>[] = [
    {
      header: "Veículo",
      accessor: (item) =>
        `${item.contract.vehicle.plate} (${item.contract.vehicle.model})`,
    },
    {
      header: "Semana",
      accessor: (item) =>
        `${new Date(item.weekStart).toLocaleDateString(
          "pt-BR"
        )} - ${new Date(item.weekEnd).toLocaleDateString("pt-BR")}`,
    },
    {
      header: "Vencimento",
      accessor: (item) => new Date(item.dueDate).toLocaleDateString("pt-BR"),
    },
    {
      header: "Valor",
      accessor: (item) =>
        item.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.status === "Pago"
              ? "bg-green-100 text-green-800"
              : item.status === "Pendente"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const handleSave = async (data: WithoutBaseItem<Driver>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      showToast("Motorista atualizado com sucesso!", "success");
      setIsFormModalOpen(false);
      mutateDriver();
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
      await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      showToast("Motorista excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/drivers");
    } catch {
      showToast("Falha ao excluir motorista.", "error");
    }
    setIsDeleting(false);
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
            Detalhes do motorista
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

      {selectedPayment && (
        <>
          <Modal
            isOpen={isPaymentFormModalOpen}
            onClose={() => setIsPaymentFormModalOpen(false)}
            title="Editar pagamento"
            size="4xl"
          >
            <PaymentForm
              initialData={selectedPayment}
              vehicles={vehicles}
              drivers={drivers}
              contracts={contracts}
              onSave={handleSavePayment}
              onCancel={() => setIsPaymentFormModalOpen(false)}
              isContractLocked={true}
            />
          </Modal>
          <DeleteConfirmationModal
            isOpen={isDeletePaymentModalOpen}
            onClose={() => setIsDeletePaymentModalOpen(false)}
            onConfirm={handleConfirmDeletePayment}
            resourceName="pagamento"
            resourceIdentifier={`Valor: ${selectedPayment.value}`}
            isDeleting={isDeletingPayment}
          />
        </>
      )}

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Histórico de pagamentos
        </h3>
        {session?.user?.plan === "BASIC" ? (
          <UpgradePlaceholder featureName="Histórico de pagamentos">
            <DataTableSkeleton columns={5} />
          </UpgradePlaceholder>
        ) : isLoadingPayments ? (
          <DataTableSkeleton columns={5} />
        ) : payments.length > 0 ? (
          <DataTable
            columns={paymentColumns}
            data={payments}
            onRowClick={() => {}}
            onEdit={handleOpenEditPaymentModal}
            onDelete={handleOpenDeletePaymentModal}
            sortColumn="dueDate"
            sortDirection="desc"
            onSort={() => {}}
          />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
            Nenhum pagamento registrado para este motorista.
          </div>
        )}
      </div>
    </div>
  );
}
