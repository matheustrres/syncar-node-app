"use client";

import { Expense, Vehicle } from "@/types";
import { useState, useEffect, FormEvent } from "react";
import { DollarSign, Car, Tags, Calendar, MessageSquare } from "lucide-react";
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

  const labelStyle = "mb-1.5 block text-sm font-semibold text-syncar-text";
  const inputStyle =
    "min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2.5 pl-11 pr-4 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          {isVehicleLocked && initialData ? (
            <div>
              <label htmlFor="expense-vehicle" className={labelStyle}>
                Veículo
              </label>
              <div className="relative">
                <Car
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-syncar-text-muted"
                  size={18}
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                <input
                  id="expense-vehicle"
                  type="text"
                  disabled
                  value={
                    vehicles.find((v) => v.id === initialData.vehicleId)
                      ?.plate || ""
                  }
                  className={`${inputStyle} cursor-not-allowed bg-syncar-surface-subtle text-syncar-text-muted`}
                />
              </div>
            </div>
          ) : (
            <CustomSelect
              variant="platform"
              id="expense-vehicle"
              name="vehicleId"
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
          variant="platform"
          id="expense-type"
          name="type"
          label="Tipo *"
          value={formData.type}
          onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
          options={typeOptions}
          Icon={Tags}
        />

        <div className="relative">
          <label htmlFor="expense-date" className={labelStyle}>
            Data *
          </label>
          <Calendar className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]" size={18} aria-hidden="true" />
          <input
            id="expense-date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={inputStyle}
          />
        </div>

        <div className="md:col-span-2 relative">
          <label htmlFor="expense-description" className={labelStyle}>
            Descrição *
          </label>
          <MessageSquare
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            id="expense-description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ex: Troca de óleo e filtros"
            className={inputStyle}
          />
        </div>

        <div className="md:col-span-2">
          <CurrencyInput
            variant="platform"
            label="Valor (R$) *"
            Icon={DollarSign}
            name="value"
            value={formData.value}
            onValueChange={(value) => handleCurrencyChange(value, "value")}
            required
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-syncar-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-11 rounded-syncar-control border border-syncar-border bg-syncar-surface px-5 text-sm font-semibold text-syncar-text hover:bg-syncar-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-syncar-control bg-syncar-action px-6 text-sm font-bold text-syncar-action-text hover:bg-syncar-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-syncar-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
