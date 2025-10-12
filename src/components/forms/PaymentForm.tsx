"use client";

import { Payment, Contract, Driver, Vehicle, WithoutBaseItem } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import {
  DollarSign,
  HelpCircle,
  Calendar,
  List,
  CheckSquare,
} from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import Tooltip from "../ui/ToolTip";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

interface PaymentFormProps {
  initialData?: Payment | null;
  contracts: Contract[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onSave: (data: WithoutBaseItem<Payment>) => void;
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

  const statusOptions: SelectOption[] = [
    { value: "Pago", label: "Pago" },
    { value: "Pendente", label: "Pendente" },
  ];

  const contractOptions: SelectOption[] = contracts
    .filter((c) => c.status === "Ativo")
    .map((contract) => {
      const driver = drivers.find((d) => d.id === contract.driverId);
      const vehicle = vehicles.find((v) => v.id === contract.vehicleId);
      return {
        value: contract.id,
        label: `${driver?.name} - ${vehicle?.plate} (${vehicle?.model})`,
      };
    });

  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId,
        weekStart: initialData.weekStart
          ? new Date(initialData.weekStart).toISOString().split("T")[0]
          : "",
        weekEnd: initialData.weekEnd
          ? new Date(initialData.weekEnd).toISOString().split("T")[0]
          : "",
        value: String(initialData.value),
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
        paymentDate: initialData.paymentDate
          ? new Date(initialData.paymentDate).toISOString().split("T")[0]
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
          <CustomSelect
            label="Contrato *"
            value={formData.contractId}
            onChange={(value) => {
              const event = {
                target: { name: "contractId", value },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleChange(event);
            }}
            options={contractOptions}
            placeholder="Selecione um contrato"
            Icon={List}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekStart"
              className="block text-sm font-medium text-gray-700"
            >
              Início da semana *
            </label>
            <Tooltip text="O primeiro dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            id="weekStart"
            type="date"
            name="weekStart"
            value={formData.weekStart}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="weekEnd"
              className="block text-sm font-medium text-gray-700"
            >
              Fim da semana *
            </label>
            <Tooltip text="O último dia do período de 7 dias que este pagamento cobre.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            id="weekEnd"
            type="date"
            name="weekEnd"
            value={formData.weekEnd}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500"
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
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700"
            >
              Data de vencimento *
            </label>
            <Tooltip text="O prazo final para o pagamento. Usado no controle de inadimplência.">
              <HelpCircle size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            id="dueDate"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data do pagamento
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <CustomSelect
          label="Status *"
          value={formData.status}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              status: value as "Pago" | "Pendente",
            }))
          }
          options={statusOptions}
          Icon={CheckSquare}
        />
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
