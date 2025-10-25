import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Maintenance, Vehicle, WithoutBaseItem } from "@/types";
import CustomSelect from "@/components/ui/CustomSelect";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { DollarSign } from "lucide-react";

interface MaintenanceFormProps {
  initialData?: Maintenance | null;
  vehicles: Vehicle[];
  isSaving: boolean;
  onSave: (data: WithoutBaseItem<Maintenance>) => void;
  onCancel: () => void;
}

const maintenanceTypes = [
  { value: "PREVENTIVA", label: "Preventiva" },
  { value: "CORRETIVA", label: "Corretiva" },
  { value: "TROCA_OLEO", label: "Troca de Óleo" },
  { value: "PNEUS", label: "Pneus" },
  { value: "FREIOS", label: "Freios" },
  { value: "OUTROS", label: "Outros" },
];

export default function MaintenanceForm({
  initialData,
  vehicles,
  isSaving,
  onSave,
  onCancel,
}: MaintenanceFormProps) {
  const [formData, setFormData] = useState<Partial<Maintenance>>(() => {
    if (initialData) {
      return {
        ...initialData,
        date: new Date(initialData.date).toISOString().split("T")[0],
        nextServiceDate: initialData.nextServiceDate
          ? new Date(initialData.nextServiceDate).toISOString().split("T")[0]
          : undefined,
      };
    }
    return {
      vehicleId: "",
      type: undefined,
      description: "",
      cost: undefined,
      date: new Date().toISOString().split("T")[0],
      mileage: 0,
      nextServiceMileage: undefined,
      nextServiceDate: undefined,
      notes: "",
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split("T")[0],
        nextServiceDate: initialData.nextServiceDate
          ? new Date(initialData.nextServiceDate).toISOString().split("T")[0]
          : undefined,
        cost: initialData.cost,
      });
    }
  }, [initialData]);

  const formatNumber = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "";
    const stringValue = String(value).replace(/\D/g, "");
    if (stringValue === "") return "";
    return new Intl.NumberFormat("pt-BR").format(parseInt(stringValue, 10));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value.replace(/\D/g, ""), 10) || undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? value : undefined,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCurrencyChange = (value: string | undefined, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vehicleId) newErrors.vehicleId = "Veículo é obrigatório.";
    if (!formData.type) newErrors.type = "Tipo de manutenção é obrigatório.";
    if (!formData.description)
      newErrors.description = "Descrição é obrigatória.";
    if (!formData.cost || parseFloat(String(formData.cost)) <= 0)
      newErrors.cost = "Custo deve ser maior que zero.";
    if (!formData.date) newErrors.date = "Data é obrigatória.";
    if (formData.mileage === undefined || formData.mileage <= 0)
      newErrors.mileage = "Quilometragem deve ser maior que zero.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Por favor, corrija os erros no formulário.", "error");
      return;
    }
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
      cost: parseCurrency(String(formData.cost)),
      date: formData.date
        ? new Date(formData.date).toISOString()
        : new Date().toISOString(),
      nextServiceDate: formData.nextServiceDate
        ? new Date(formData.nextServiceDate).toISOString()
        : null,
      mileage: formData.mileage ? parseInt(String(formData.mileage), 10) : 0,
      nextServiceMileage: formData.nextServiceMileage
        ? parseInt(String(formData.nextServiceMileage), 10)
        : null,
    } as WithoutBaseItem<Maintenance>);
  };

  const vehicleOptions = (
    !initialData
      ? vehicles.filter(
          (v) => v.status === "Disponível" || v.status === "Alugado"
        )
      : vehicles
  ).map((v) => ({
    value: v.id,
    label: `${v.plate} - ${v.brand} ${v.model}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="vehicleId"
          className="block text-sm font-medium text-gray-700"
        >
          Veículo *
        </label>
        <CustomSelect
          id="vehicleId"
          name="vehicleId"
          options={vehicleOptions}
          value={formData.vehicleId || ""}
          onChange={(value) => handleSelectChange("vehicleId", value)}
          placeholder="Selecione um veículo"
          className="mt-1 block w-full"
        />
        {errors.vehicleId && (
          <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo de manutenção *
        </label>
        <CustomSelect
          id="type"
          name="type"
          options={maintenanceTypes}
          value={formData.type || ""}
          onChange={(value) => handleSelectChange("type", value)}
          placeholder="Selecione o tipo"
          className="mt-1 block w-full"
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição *
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <CurrencyInput
          id="cost"
          name="cost"
          label="Custo *"
          Icon={DollarSign}
          value={formData.cost}
          onValueChange={(value) => handleCurrencyChange(value, "cost")}
          required
        />
        {errors.cost && (
          <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Data da manutenção *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date ? String(formData.date) : ""}
          onChange={handleDateChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="mileage"
          className="block text-sm font-medium text-gray-700"
        >
          Quilometragem *
        </label>
        <input
          type="text"
          id="mileage"
          name="mileage"
          value={formatNumber(formData.mileage)}
          onChange={handleNumericChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.mileage && (
          <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="nextServiceMileage"
          className="block text-sm font-medium text-gray-700"
        >
          Próxima manutenção (KM)
        </label>
        <input
          type="text"
          id="nextServiceMileage"
          name="nextServiceMileage"
          value={formatNumber(formData.nextServiceMileage ?? undefined)}
          onChange={handleNumericChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="nextServiceDate"
          className="block text-sm font-medium text-gray-700"
        >
          Próxima manutenção (Data)
        </label>
        <input
          type="date"
          id="nextServiceDate"
          name="nextServiceDate"
          value={
            formData.nextServiceDate ? String(formData.nextServiceDate) : ""
          }
          onChange={handleDateChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : "Salvar Manutenção"}
        </button>
      </div>
    </form>
  );
}
