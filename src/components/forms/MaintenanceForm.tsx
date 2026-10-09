import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Maintenance, Vehicle, WithoutBaseItem } from "@/types";
import CustomSelect from "@/components/ui/CustomSelect";
import CurrencyInput from "@/components/ui/CurrencyInput";
import {
  CalendarDays,
  CarFront,
  DollarSign,
  FileText,
  Gauge,
  MessageSquare,
  Wrench,
} from "lucide-react";

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
    if (!formData.cost || !Number.isFinite(Number(formData.cost)) || Number(formData.cost) <= 0)
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
    onSave({
      vehicleId: formData.vehicleId,
      type: formData.type,
      description: formData.description?.trim() || "",
      cost: Number(formData.cost),
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
      notes: formData.notes,
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

  const labelStyle = "mb-1.5 block text-sm font-semibold text-syncar-text";
  const fieldStyle =
    "block min-h-11 w-full rounded-[var(--syncar-radius-control)] border border-syncar-border bg-syncar-surface px-3 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";
  const errorStyle = "mt-1 text-sm text-syncar-danger";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <div className="relative">
          <label
            htmlFor="vehicleId"
            className={labelStyle}
          >
            Veículo *
          </label>
          <CustomSelect
            variant="platform"
            id="vehicleId"
            name="vehicleId"
            options={vehicleOptions}
            value={formData.vehicleId || ""}
            onChange={(value) => handleSelectChange("vehicleId", value)}
            placeholder="Selecione um veículo"
            className="block w-full"
            Icon={CarFront}
          />
          {errors.vehicleId && (
            <p className={errorStyle}>{errors.vehicleId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="type"
            className={labelStyle}
          >
            Tipo de manutenção *
          </label>
          <CustomSelect
            variant="platform"
            id="type"
            name="type"
            options={maintenanceTypes}
            value={formData.type || ""}
            onChange={(value) => handleSelectChange("type", value)}
            placeholder="Selecione o tipo"
            className="block w-full"
            Icon={Wrench}
          />
          {errors.type && (
            <p className={errorStyle}>{errors.type}</p>
          )}
        </div>

        <div className="md:col-span-2 relative">
          <label
            htmlFor="description"
            className={labelStyle}
          >
            Descrição (opcional)
          </label>
          <FileText
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`${fieldStyle} resize-y py-2.5 pl-11`}
          ></textarea>
        </div>

        <div className="relative">
          <CurrencyInput
            variant="platform"
            id="cost"
            name="cost"
            label="Custo *"
            Icon={DollarSign}
            value={formData.cost}
            onValueChange={(value) => handleCurrencyChange(value, "cost")}
            required
          />
          {errors.cost && (
            <p className={errorStyle}>{errors.cost}</p>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="date"
            className={labelStyle}
          >
            Data da manutenção *
          </label>
          <CalendarDays
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date ? String(formData.date) : ""}
            onChange={handleDateChange}
            className={`${fieldStyle} syncar-date-input-left-icon pl-11`}
          />
          {errors.date && (
            <p className={errorStyle}>{errors.date}</p>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="mileage"
            className={labelStyle}
          >
            Quilometragem *
          </label>
          <Gauge
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            id="mileage"
            name="mileage"
            value={formatNumber(formData.mileage)}
            onChange={handleNumericChange}
            className={`${fieldStyle} pl-11`}
          />
          {errors.mileage && (
            <p className={errorStyle}>{errors.mileage}</p>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="nextServiceMileage"
            className={labelStyle}
          >
            Próxima manutenção (KM)
          </label>
          <Gauge
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            id="nextServiceMileage"
            name="nextServiceMileage"
            value={formatNumber(formData.nextServiceMileage ?? undefined)}
            onChange={handleNumericChange}
            className={`${fieldStyle} pl-11`}
          />
        </div>

        <div className="relative">
          <label
            htmlFor="nextServiceDate"
            className={labelStyle}
          >
            Próxima manutenção (Data)
          </label>
          <CalendarDays
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="date"
            id="nextServiceDate"
            name="nextServiceDate"
            value={
              formData.nextServiceDate ? String(formData.nextServiceDate) : ""
            }
            onChange={handleDateChange}
            className={`${fieldStyle} syncar-date-input-left-icon pl-11`}
          />
        </div>

        <div className="md:col-span-2 relative">
          <label
            htmlFor="notes"
            className={labelStyle}
          >
            Observações
          </label>
          <MessageSquare
            className="pointer-events-none absolute left-3 top-9 text-syncar-text-muted [stroke-width:1.75]"
            size={18}
            aria-hidden="true"
          />
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ""}
            onChange={handleChange}
            className={`${fieldStyle} resize-y py-2.5 pl-11`}
          ></textarea>
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
          {isSaving ? "Salvando..." : "Salvar Manutenção"}
        </button>
      </div>
    </form>
  );
}
