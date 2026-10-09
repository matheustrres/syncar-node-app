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
}: CustomSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {label && (
            <Listbox.Label className="mb-1.5 block text-sm font-semibold text-syncar-text">
              {label}
            </Listbox.Label>
          )}

          {Icon && (
            <Icon
              className={`absolute left-3 ${label ? "top-9" : "top-3"} z-10 text-syncar-text-muted`}
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          )}

          <Listbox.Button
            id={id}
            name={name}
            className={`relative h-11 w-full cursor-default rounded-lg border border-syncar-border bg-syncar-surface py-2 pr-10 text-left text-sm text-syncar-text focus:outline-none focus-visible:border-syncar-focus focus-visible:ring-2 focus-visible:ring-syncar-focus/25 ${Icon ? "pl-11" : "pl-4"}`}
          >
            <span
              className={`block truncate ${selectedOption ? "text-syncar-text" : "text-syncar-text-muted"}`}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || "Selecione uma opção"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className="h-4 w-4 text-syncar-text-muted"
                aria-hidden="true"
                strokeWidth={1.75}
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-syncar-border bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-syncar-surface-subtle" : ""} text-syncar-text`
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
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-syncar-success">
                          <Check
                            className="h-[18px] w-[18px]"
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
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
