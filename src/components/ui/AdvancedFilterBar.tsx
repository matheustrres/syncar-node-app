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
    <div className="mb-6 rounded-syncar-panel border border-syncar-border bg-syncar-surface p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtersConfig.map((filter) => {
          const filterState = filterStates[filter.id];

          return (
            <div key={filter.id}>
              {filter.type === "text" && (
                <div className="relative">
                  <label className="mb-1 block text-sm font-semibold text-syncar-text">
                    {filter.label}
                  </label>
                  {filter.icon && (
                    <filter.icon
                      className="absolute left-3 top-9 text-syncar-muted"
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
                    className={`min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 ${
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
                  variant="platform"
                  Icon={filter.icon}
                />
              )}

              {filter.type === "date-range" &&
                typeof filterState === "object" &&
                "startDate" in filterState && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-syncar-text">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-muted"
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
                          className={`min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-muted"
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
                          className={`min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 ${
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
                    <label className="mb-1 block text-sm font-semibold text-syncar-text">
                      {filter.label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-muted"
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
                          className={`min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 ${
                            filter.icon ? "pl-10" : "pl-4"
                          }`}
                        />
                      </div>
                      <div className="relative flex-1">
                        {filter.icon && (
                          <filter.icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-muted"
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
                          className={`min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 ${
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
