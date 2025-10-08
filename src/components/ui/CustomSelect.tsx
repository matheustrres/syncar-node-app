"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown, LucideIcon } from "lucide-react";
import { Fragment } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  Icon?: LucideIcon;
  placeholder?: string;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  Icon,
  placeholder,
}: CustomSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </Listbox.Label>

          {Icon && (
            <Icon
              className="absolute left-3 top-9 text-gray-400 z-10"
              size={20}
            />
          )}

          <Listbox.Button
            className={`relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 sm:text-sm h-11 ${Icon ? "pl-11" : "pl-4"}`}
          >
            <span
              className={`block truncate ${selectedOption ? "text-gray-900" : "text-gray-500"}`}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || "Selecione uma opção"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className="h-5 w-5 text-gray-400"
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
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"}`
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
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
