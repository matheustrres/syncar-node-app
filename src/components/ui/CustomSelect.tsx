"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown, LucideIcon } from "lucide-react";
import { Fragment } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  Icon?: LucideIcon;
  placeholder?: string;
  className?: string;
  variant?: "default" | "platform";
}

export default function CustomSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  Icon,
  placeholder,
  className,
  variant = "default",
}: CustomSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {label && (
            <Listbox.Label className={`mb-1.5 block text-sm font-semibold ${variant === "platform" ? "text-syncar-text" : "text-gray-700"}`}>
              {label}
            </Listbox.Label>
          )}

          {Icon && (
            <Icon
              className={`absolute left-3 top-9 z-10 ${variant === "platform" ? "text-syncar-text-muted" : "text-gray-400"}`}
              size={20}
            />
          )}

          <Listbox.Button
            id={id}
            name={name}
            className={`relative h-11 w-full cursor-default rounded-lg border py-2 pr-10 text-left text-sm focus:outline-none focus-visible:ring-2 ${variant === "platform" ? "border-syncar-border bg-syncar-surface text-syncar-text focus-visible:border-syncar-focus focus-visible:ring-syncar-focus/25" : "border-gray-300 bg-gray-100 focus-visible:border-indigo-500 focus-visible:ring-white/75"} ${Icon ? "pl-11" : "pl-4"}`}
          >
            <span
              className={`block truncate ${variant === "platform" ? (selectedOption ? "text-syncar-text" : "text-syncar-text-muted") : (selectedOption ? "text-gray-900" : "text-gray-500")}`}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || "Selecione uma opção"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className={`h-5 w-5 ${variant === "platform" ? "text-syncar-text-muted" : "text-gray-400"}`}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className={`absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm ${variant === "platform" ? "border border-syncar-border" : "ring-1 ring-black/5"}`}>
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${variant === "platform" ? (active ? "bg-syncar-surface-subtle text-syncar-text" : "text-syncar-text") : (active ? "bg-blue-100 text-blue-900" : "text-gray-900")}`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${variant === "platform" ? "text-syncar-success" : "text-blue-600"}`}>
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
