"use client";

import { Driver } from "@/types";
import { useState, useEffect, FormEvent, useRef } from "react";
import { IMaskInput } from "react-imask";
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  CheckSquare,
  Home,
  AlertCircle,
} from "lucide-react";
import CustomSelect, { SelectOption } from "../ui/CustomSelect";

interface DriverFormProps {
  initialData?: Driver | null;
  apiError?: string | null;
  isSaving?: boolean;
  onSave: (
    data: Omit<Driver, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
  apiError,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    cnh: "",
    cnhValidity: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    status: "Ativo",
  });

  const [addressFieldsEnabled, setAddressFieldsEnabled] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const numeroRef = useRef<HTMLInputElement>(null);

  const statusOptions: SelectOption[] = [
    { value: "Ativo", label: "Ativo" },
    { value: "Inativo", label: "Inativo" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        cpf: initialData.cpf || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        cnh: initialData.cnh || "",
        cnhValidity: initialData.cnhValidity
          ? new Date(initialData.cnhValidity).toISOString().split("T")[0]
          : "",
        cep: initialData.cep || "",
        logradouro: initialData.logradouro || "",
        numero: initialData.numero || "",
        complemento: initialData.complemento || "",
        bairro: initialData.bairro || "",
        cidade: initialData.cidade || "",
        uf: initialData.uf || "",
        status: initialData.status || "Ativo",
      });
      if (initialData.cep) {
        setAddressFieldsEnabled(true);
      }
    }
  }, [initialData]);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    setCepError(null);

    if (cep.length === 0) {
      setAddressFieldsEnabled(false);
      return;
    }
    if (cep.length !== 8) {
      setAddressFieldsEnabled(false);
      if (e.target.value !== "") setCepError("CEP deve ter 8 dígitos.");
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP inválido!");
        setAddressFieldsEnabled(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      }));

      setAddressFieldsEnabled(true);
      numeroRef.current?.focus();
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Falha ao buscar CEP.");
      setAddressFieldsEnabled(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaskedInputChange = (name: string, value: string) => {
    if (name === "cep") {
      if (cepError) {
        setCepError(null);
      }
      const cleanedCep = value.replace(/\D/g, "");
      if (cleanedCep.length === 0) {
        setFormData((prev) => ({
          ...prev,
          logradouro: "",
          bairro: "",
          cidade: "",
          uf: "",
        }));
        setAddressFieldsEnabled(false);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const {
      name,
      cpf,
      phone,
      email,
      cnh,
      cnhValidity,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      status,
    } = formData;

    onSave({
      name,
      cpf,
      phone,
      email,
      cnh,
      cnhValidity: new Date(cnhValidity).toISOString(),
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      status,
    });
  };

  // Estilos para os inputs
  const inputStyle =
    "pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white";
  const inputWithoutIconStyle =
    "px-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white";

  // NOVO ESTILO para campos autocompletados (sem focus:bg-white)
  const autoFilledInputStyle =
    "pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500";
  const autoFilledInputWithoutIconStyle =
    "px-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500";
  const disabledInputStyle =
    "disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <div className="lg:col-span-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <User
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Digite o nome completo"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <FileText
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <IMaskInput
            mask="000.000.000-00"
            name="cpf"
            value={formData.cpf}
            onAccept={(value) => handleMaskedInputChange("cpf", String(value))}
            required
            placeholder="000.000.000-00"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <Phone
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <IMaskInput
            mask="(00) 00000-0000"
            name="phone"
            value={formData.phone}
            onAccept={(value) =>
              handleMaskedInputChange("phone", String(value))
            }
            required
            placeholder="(00) 00000-0000"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Mail
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@exemplo.com"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNH *
          </label>
          <FileText
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <input
            type="text"
            name="cnh"
            value={formData.cnh}
            onChange={handleChange}
            required
            placeholder="00000000000"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validade CNH *
          </label>
          <Calendar
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <input
            type="date"
            name="cnhValidity"
            value={formData.cnhValidity}
            onChange={handleChange}
            required
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-4">
          <hr className="my-2 border-gray-200" />
        </div>

        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <MapPin
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <IMaskInput
            mask="00000-000"
            name="cep"
            value={formData.cep}
            onAccept={(value) => handleMaskedInputChange("cep", String(value))}
            onBlur={handleCepBlur}
            required
            placeholder="00000-000"
            className={`${inputStyle} ${cepError ? "border-red-500" : "border-gray-200"}`}
          />
          {cepError && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{cepError}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logradouro *
          </label>
          <Home
            className="absolute left-3 top-9 text-gray-400 z-10"
            size={20}
          />
          <input
            type="text"
            name="logradouro"
            value={formData.logradouro}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            readOnly
            className={`${autoFilledInputStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
            placeholder="123"
            ref={numeroRef}
            className={`${inputWithoutIconStyle}`}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Apto 101"
            className={`${inputWithoutIconStyle}`}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            readOnly
            className={`${autoFilledInputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            readOnly
            className={`${autoFilledInputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UF *
          </label>
          <input
            type="text"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            required
            placeholder="UF"
            disabled={!addressFieldsEnabled}
            readOnly
            className={`${autoFilledInputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1">
          <CustomSelect
            label="Status *"
            value={formData.status}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            options={statusOptions}
            Icon={CheckSquare}
          />
        </div>
      </div>

      {apiError && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}

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

export default DriverForm;
