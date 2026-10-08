"use client";

import { Driver, WithoutBaseItem } from "@/types";
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

import { normalizeString } from "@/lib/string-utils";

interface DriverFormProps {
  initialData?: Driver | null;
  isSaving?: boolean;
  onSave: (data: WithoutBaseItem<Driver>) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
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
    if (!cep.length) {
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
        setCepError("CEP inválido! Preencha o endereço manualmente.");
        setAddressFieldsEnabled(true); // Habilita campos em caso de erro
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
      setCepError("Falha ao buscar CEP. Preencha o endereço manualmente.");
      setAddressFieldsEnabled(true); // Habilita campos em caso de erro
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
      nameNormalized: normalizeString(name),
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

  const labelStyle = "mb-1.5 block text-sm font-semibold text-syncar-text";
  const inputStyle =
    "min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2.5 pl-11 pr-4 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";
  const inputWithoutIconStyle =
    "min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface px-4 py-2.5 text-sm text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20";
  const disabledInputStyle =
    "disabled:cursor-not-allowed disabled:bg-syncar-surface-subtle disabled:text-syncar-text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative md:col-span-2 lg:col-span-4">
          <label htmlFor="name" className={labelStyle}>
            Nome Completo *
          </label>
          <User
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Digite o nome completo"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="cpf" className={labelStyle}>
            CPF *
          </label>
          <FileText
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <IMaskInput
            mask="000.000.000-00"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onAccept={(value) => handleMaskedInputChange("cpf", String(value))}
            required
            placeholder="000.000.000-00"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="phone" className={labelStyle}>
            Telefone *
          </label>
          <Phone
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <IMaskInput
            mask="(00) 00000-0000"
            id="phone"
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

        <div className="relative md:col-span-2 lg:col-span-4">
          <label htmlFor="email" className={labelStyle}>
            Email *
          </label>
          <Mail
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@exemplo.com"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="cnh" className={labelStyle}>
            CNH *
          </label>
          <FileText
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <IMaskInput
            mask="00000000000"
            type="text"
            id="cnh"
            name="cnh"
            value={formData.cnh}
            onAccept={(value) => handleMaskedInputChange("cnh", String(value))}
            required
            placeholder="00000000000"
            className={inputStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="cnhValidity" className={labelStyle}>
            Validade CNH *
          </label>
          <Calendar
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <input
            type="date"
            id="cnhValidity"
            name="cnhValidity"
            value={formData.cnhValidity}
            onChange={handleChange}
            required
            className={inputStyle}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <hr className="my-2 border-syncar-border" />
        </div>

        <div className="lg:col-span-1 relative">
          <label htmlFor="cep" className={labelStyle}>
            CEP *
          </label>
          <MapPin
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <IMaskInput
            mask="00000-000"
            id="cep"
            name="cep"
            value={formData.cep}
            onAccept={(value) => handleMaskedInputChange("cep", String(value))}
            onBlur={handleCepBlur}
            required
            placeholder="00000-000"
            aria-invalid={!!cepError}
            aria-describedby={cepError ? "cep-error" : undefined}
            className={`${inputStyle} ${cepError ? "border-syncar-danger focus:border-syncar-danger focus:ring-syncar-danger/20" : ""}`}
          />
          {cepError && (
            <div
              id="cep-error"
              className="mt-1 flex items-center gap-1 text-sm text-syncar-danger"
            >
              <AlertCircle size={16} aria-hidden="true" />
              <span>{cepError}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 relative">
          <label htmlFor="logradouro" className={labelStyle}>
            Logradouro *
          </label>
          <Home
            className="pointer-events-none absolute left-3 top-9 z-10 text-syncar-text-muted"
            aria-hidden="true"
            size={20}
          />
          <input
            type="text"
            id="logradouro"
            name="logradouro"
            value={formData.logradouro}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            className={`${inputStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label htmlFor="numero" className={labelStyle}>
            Número *
          </label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
            placeholder="123"
            ref={numeroRef}
            className={inputWithoutIconStyle}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label htmlFor="complemento" className={labelStyle}>
            Complemento
          </label>
          <input
            type="text"
            id="complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Apto 101"
            className={inputWithoutIconStyle}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="bairro" className={labelStyle}>
            Bairro *
          </label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            className={`${inputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-2 relative">
          <label htmlFor="cidade" className={labelStyle}>
            Cidade *
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
            placeholder="Preenchimento automático"
            disabled={!addressFieldsEnabled}
            className={`${inputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1 relative">
          <label htmlFor="uf" className={labelStyle}>
            UF *
          </label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            required
            placeholder="UF"
            disabled={!addressFieldsEnabled}
            className={`${inputWithoutIconStyle} ${disabledInputStyle}`}
          />
        </div>

        <div className="lg:col-span-1">
          <CustomSelect
            variant="platform"
            id="status"
            name="status"
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

export default DriverForm;
