"use client";

import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";
import { LucideIcon } from "lucide-react";

interface CustomCurrencyInputProps extends CurrencyInputProps {
  label: string;
  Icon: LucideIcon;
  variant?: "default" | "platform";
}

const CustomCurrencyInput: React.FC<CustomCurrencyInputProps> = ({
  label,
  Icon,
  name,
  value,
  onValueChange,
  required,
  variant = "default",
}) => {
  return (
    <div className="relative">
      <label htmlFor={name} className={`mb-1.5 block text-sm font-semibold ${variant === "platform" ? "text-syncar-text" : "text-gray-700"}`}>
        {label}
      </label>
      <Icon className={`pointer-events-none absolute left-3 top-9 ${variant === "platform" ? "text-syncar-text-muted" : "text-gray-400"}`} size={20} aria-hidden="true" />
      <CurrencyInput
        id={name}
        name={name}
        className={`h-11 w-full rounded-lg border pl-11 pr-4 text-sm focus:outline-none focus:ring-2 ${variant === "platform" ? "border-syncar-border bg-syncar-surface text-syncar-text placeholder:text-syncar-text-muted focus:border-syncar-focus focus:ring-syncar-focus/20" : "border-gray-300 bg-gray-100 focus:ring-blue-500"}`}
        value={value}
        onValueChange={onValueChange}
        intlConfig={{ locale: "pt-BR", currency: "BRL" }}
        placeholder="R$ 0,00"
        required={required}
        decimalsLimit={2}
        decimalScale={2}
        allowNegativeValue={false}
      />
    </div>
  );
};

export default CustomCurrencyInput;
