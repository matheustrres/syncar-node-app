"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchPlaceholder: string;
  filterOptions: FilterOption[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export default function FilterBar({
  searchPlaceholder,
  filterOptions,
  onSearchChange,
  onFilterChange,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500); // 500ms debounce delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearchChange]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    onFilterChange(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-syncar-muted"
          size={20}
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface px-4 py-2 pl-10 font-sans text-sm text-syncar-text placeholder:text-syncar-muted focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20"
        />
      </div>
      <select
        value={filterValue}
        onChange={handleFilterChange}
        className="min-h-11 w-full rounded-syncar-control border border-syncar-border bg-syncar-surface px-4 py-2 font-sans text-sm text-syncar-text focus:border-syncar-focus focus:outline-none focus:ring-2 focus:ring-syncar-focus/20 md:w-auto"
      >
        <option value="">{filterOptions[0]?.label || "Todos"}</option>
        {filterOptions.slice(1).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
