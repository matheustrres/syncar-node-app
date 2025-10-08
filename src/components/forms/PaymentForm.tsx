"use client";

import { Payment, Contract, Driver, Vehicle } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import { Hash, DollarSign, HelpCircle } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import Tooltip from "../ui/ToolTip";

interface PaymentFormProps {
  initialData?: Payment | null;
  contracts: Contract[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onSave: (data: Omit<Payment, "id">) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  contracts,
  drivers,
  vehicles,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    contractId: "",
    weekStart: "",
    weekEnd: "",
    value: undefined as string | undefined,
    dueDate: "",
    paymentDate: "",
    status: "Pago" as "Pago" | "Pendente",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId,
        weekStart: initialData.weekStart.split("T")[0],
        weekEnd: initialData.weekEnd.split("T")[0],
        value: String(initialData.value),
        dueDate: initialData.dueDate.split("T")[0],
        paymentDate: initialData.paymentDate
          ? initialData.paymentDate.split("T")[0]
          : "",
        status: initialData.status as "Pago" | "Pendente",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "contractId") {
      const selectedContract = contracts.find((c) => c.id === value);
      if (selectedContract) {
        setFormData((prev) => ({
          ...prev,
          value: String(selectedContract.weeklyValue),
        }));
      }
    }
  };

  const handleCurrencyChange = (value: string | undefined, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parseCurrency = (value: string | undefined): number => {
      if (!value) return 0;
      const cleanedValue = value
        .replace(/R\$\s?/, "")
        .replace(/\./g, "")
        .replace(",", ".");
      return parseFloat(cleanedValue) || 0;
    };
    const dataToSave = {
      ...formData,
      value: parseCurrency(formData.value),
      weekStart: new Date(formData.weekStart).toISOString(),
      weekEnd: new Date(formData.weekEnd).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      paymentDate: formData.paymentDate
        ? new Date(formData.paymentDate).toISOString()
        : null,
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contrato *
          </label>
          <select
            name="contractId"
            value={formData.contractId}
            onChange={handleChange}
            required
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um contrato</option>
            {contracts
              .filter((c) => c.status === "Ativo")
              .map((contract) => {
                const driver = drivers.find((d) => d.id === contract.driverId);
                const vehicle = vehicles.find(
                  (v) => v.id === contract.vehicleId
                );
                return (
                  <option key={contract.id} value={contract.id}>
                    {driver?.name} - {vehicle?.plate} ({vehicle?.model})
                  </option>
                );
              })}
          </select>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekStart"
              className="block text-sm font-medium text-gray-700"
            >
              Início da Semana *
            </label>
            <Tooltip text="O primeiro dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <input
            id="weekStart"
            type="date"
            name="weekStart"
            value={formData.weekStart}
            onChange={handleChange}
            required
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekEnd"
              className="block text-sm font-medium text-gray-700"
            >
              Fim da Semana *
            </label>
            <Tooltip text="O último dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <input
            id="weekEnd"
            type="date"
            name="weekEnd"
            value={formData.weekEnd}
            onChange={handleChange}
            required
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <CurrencyInput
          label="Valor (R$) *"
          Icon={DollarSign}
          name="value"
          value={formData.value}
          onValueChange={(value) => handleCurrencyChange(value, "value")}
          required
        />
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700"
            >
              Data de Vencimento *
            </label>
            <Tooltip text="O prazo final para o pagamento. Usado no controle de inadimplência.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <input
            id="dueDate"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data do Pagamento
          </label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <Hash className="absolute left-3 top-8 text-gray-400" size={18} />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
