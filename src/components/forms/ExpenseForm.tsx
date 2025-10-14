"use client";

import { Expense, Vehicle } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import { DollarSign, Car, List, Calendar, MessageSquare } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import CustomSelect from "../ui/CustomSelect";

interface ExpenseFormProps {
  initialData?: Expense | null;
  vehicles: Vehicle[];
  isSaving?: boolean;
  isVehicleLocked?: boolean;
  onSave: (
    data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  vehicles,
  isSaving,
  isVehicleLocked = false,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    vehicleId: "",
    type: "Manutenção",
    description: "",
    value: undefined as string | undefined,
    date: new Date().toISOString().split("T")[0],
  });

  const typeOptions = [
    { value: "Manutenção", label: "Manutenção" },
    { value: "IPVA", label: "IPVA" },
    { value: "Seguro", label: "Seguro" },
    { value: "Documentação", label: "Documentação" },
    { value: "Multa", label: "Multa" },
    { value: "Outros", label: "Outros" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: initialData.vehicleId,
        type: initialData.type,
        description: initialData.description,
        value: String(initialData.value),
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    onSave({
      ...formData,
      value: parseCurrency(formData.value),
      date: new Date(formData.date).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          {isVehicleLocked && initialData ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veículo
              </label>
              <div className="relative">
                <Car
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  disabled
                  value={
                    vehicles.find((v) => v.id === initialData.vehicleId)
                      ?.plate || ""
                  }
                  className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>
          ) : (
            <CustomSelect
              label="Veículo *"
              value={formData.vehicleId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, vehicleId: value }))
              }
              options={vehicles.map((v) => ({
                value: v.id,
                label: `${v.plate} - ${v.brand} ${v.model}`,
              }))}
              placeholder="Selecione um veículo"
              Icon={Car}
            />
          )}
        </div>

        <CustomSelect
          label="Tipo *"
          value={formData.type}
          onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
          options={typeOptions}
          Icon={List}
        />

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data *
          </label>
          <Calendar className="absolute left-3 top-9 text-gray-400" size={20} />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <MessageSquare
            className="absolute left-3 top-9 text-gray-400"
            size={20}
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ex: Troca de óleo e filtros"
            className="pl-11 pr-4 py-2 w-full border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <CurrencyInput
            label="Valor (R$) *"
            Icon={DollarSign}
            name="value"
            value={formData.value}
            onValueChange={(value) => handleCurrencyChange(value, "value")}
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
