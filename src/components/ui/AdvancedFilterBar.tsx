import React, { useState, useEffect } from "react";
import CustomSelect, { SelectOption } from "./CustomSelect";
import { LucideIcon } from "lucide-react";

export interface FilterConfig {
  id: string;
  label: string;
  type: "text" | "select" | "date-range" | "number-range";
  field: string; // The field name to filter in the backend
  options?: SelectOption[]; // For 'select' type
  placeholder?: string;
  icon?: LucideIcon;
}

type FilterStateValue =
  | string
  | { startDate: string; endDate: string }
  | { min: string; max: string };

interface AdvancedFilterBarProps {
  filtersConfig: FilterConfig[];
  onFilterChange: (filters: Record<string, FilterStateValue>) => void;
}

const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filtersConfig,
  onFilterChange,
}) => {
  const [filterStates, setFilterStates] = useState<
    Record<string, FilterStateValue>
  >(() => {
    const initialState: Record<string, FilterStateValue> = {};
    filtersConfig.forEach((filter) => {
      if (filter.type === "date-range") {
        initialState[filter.id] = { startDate: "", endDate: "" };
      } else if (filter.type === "number-range") {
        initialState[filter.id] = { min: "", max: "" };
      } else {
        initialState[filter.id] = "";
      }
    });
    return initialState;
  });

  const [debouncedFilterStates, setDebouncedFilterStates] =
    useState<Record<string, FilterStateValue>>(filterStates);

  // Debounce effect for text and number inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterStates(filterStates);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [filterStates]);

  // Effect to call onFilterChange when debouncedFilterStates changes
  useEffect(() => {
    const activeFilters: Record<string, FilterStateValue> = {};
    filtersConfig.forEach((config) => {
      const value = debouncedFilterStates[config.id];
      if (config.type === "text" || config.type === "select") {
        if (typeof value === "string" && value) {
          activeFilters[config.field] = value;
        }
      } else if (config.type === "date-range") {
        if (
          typeof value === "object" &&
          value !== null &&
          "startDate" in value &&
          "endDate" in value
        ) {
          if (value.startDate || value.endDate) {
            activeFilters[config.field] = value;
          }
        }
      } else if (config.type === "number-range") {
        if (
          typeof value === "object" &&
          value !== null &&
          "min" in value &&
          "max" in value
        ) {
          if (value.min || value.max) {
            activeFilters[config.field] = value;
          }
        }
      }
    });
    onFilterChange(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilterStates]);

  const handleTextChange = (id: string, value: string) => {
    setFilterStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFilterStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateRangeChange = (
    id: string,
    type: "startDate" | "endDate",
    value: string
  ) => {
    setFilterStates((prev) => {
      const currentRange = prev[id];
      if (
        typeof currentRange === "object" &&
        currentRange !== null &&
        "startDate" in currentRange &&
        "endDate" in currentRange
      ) {
        return { ...prev, [id]: { ...currentRange, [type]: value } };
      }
      return prev; // Should not happen if initial state is correct
    });
  };

  const handleNumberRangeChange = (
    id: string,
    type: "min" | "max",
    value: string
  ) => {
    setFilterStates((prev) => {
      const currentRange = prev[id];
      if (
        typeof currentRange === "object" &&
        currentRange !== null &&
        "min" in currentRange &&
        "max" in currentRange
      ) {
        return { ...prev, [id]: { ...currentRange, [type]: value } };
      }
      return prev; // Should not happen if initial state is correct
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtersConfig.map((filter) => {
          const filterState = filterStates[filter.id];

          return (
            <div key={filter.id}>
              {filter.type === "text" && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {filter.icon && (
                    <filter.icon
                      className="absolute left-3 top-9 text-gray-400"
                      size={20}
                    />
                  )}
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={typeof filterState === "string" ? filterState : ""}
                    onChange={(e) =>
                      handleTextChange(filter.id, e.target.value)
                    }
                    className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans text-sm text-gray-700 ${
                      filter.icon ? "pl-10" : "pl-4"
                    }`}
                  />
                </div>
              )}

              {filter.type === "select" && (
                <CustomSelect
                  label={filter.label}
                  value={typeof filterState === "string" ? filterState : ""}
                  onChange={(value) => handleSelectChange(filter.id, value)}
                  options={filter.options || []}
                  placeholder={filter.placeholder}
                  Icon={filter.icon}
                />
              )}

              {filter.type === "date-range" &&
                typeof filterState === "object" &&
                "startDate" in filterState && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                        )}
                        <input
                          type="date"
                          value={filterState.startDate}
                          onChange={(e) =>
                            handleDateRangeChange(
                              filter.id,
                              "startDate",
                              e.target.value
                            )
                          }
                          className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans text-sm text-gray-700 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                        )}
                        <input
                          type="date"
                          value={filterState.endDate}
                          onChange={(e) =>
                            handleDateRangeChange(
                              filter.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans text-sm text-gray-700 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

              {filter.type === "number-range" &&
                typeof filterState === "object" &&
                "min" in filterState && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                        )}
                        <input
                          type="number"
                          placeholder="Min"
                          value={filterState.min}
                          onChange={(e) =>
                            handleNumberRangeChange(
                              filter.id,
                              "min",
                              e.target.value
                            )
                          }
                          className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans text-sm text-gray-700 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                        )}
                        <input
                          type="number"
                          placeholder="Max"
                          value={filterState.max}
                          onChange={(e) =>
                            handleNumberRangeChange(
                              filter.id,
                              "max",
                              e.target.value
                            )
                          }
                          className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans text-sm text-gray-700 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedFilterBar;
