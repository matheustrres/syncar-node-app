"use client";

import {
  Driver,
  Vehicle,
  Contract,
  ContractWithDetails,
  ProfileData,
  Payment,
  Expense,
  CashFlowReportItem,
  OverduePaymentReportItem,
  DriverSummaryReportItem,
  VehiclePerformanceReportItem,
  ExpenseAnalysisReport,
  Maintenance,
} from "@/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Type Definitions ---

export type MaintenanceWithRelations = Maintenance & {
  vehicle: Pick<Vehicle, "id" | "plate" | "model">;
};

export type ContractWithRelations = Contract & {
  driver: { name: string };
  vehicle: { plate: string; model: string };
};

export type PaymentWithRelations = Payment & {
  contract: {
    driver: { name: string };
    vehicle: { plate: string; model: string };
  };
};

export type FinancialPayment = Pick<Payment, "id" | "dueDate" | "value" | "paymentDate"> & {
  contract: {
    driver: { name: string };
    vehicle: { plate: string; model: string };
  };
};

export type ExpenseWithRelations = Expense & {
  vehicle: { plate: string } | null;
};

export interface VehicleFilters {
  search?: string;
  plate?: string;
  brand?: string;
  model?: string;
  status?: string;
  yearMin?: string;
  yearMax?: string;
  kmMin?: string;
  kmMax?: string;
}

export interface DriverFilters {
  name?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  status?: string;
  missingCnh?: string;
}

export interface ContractFilters {
  driverName?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  status?: string;
  weeklyValueMin?: string;
  weeklyValueMax?: string;
  startDateStartDate?: string;
  startDateEndDate?: string;
}

export interface MaintenanceFilters {
  vehicle?: string;
  vehicleId?: string;
  type?: string;
  description?: string;
  costMin?: string;
  costMax?: string;
  dateStartDate?: string;
  dateEndDate?: string;
  mileageMin?: string;
  mileageMax?: string;
}

// --- Paginated Hooks ---

export function useFetchMaintenance(
  page: number,
  limit: number,
  filters: MaintenanceFilters,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { maintenance: MaintenanceWithRelations[]; total: number }
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("sortColumn", sortColumn);
  queryParams.append("sortDirection", sortDirection);

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      if (value.min) queryParams.append(`${key}Min`, value.min);
      if (value.max) queryParams.append(`${key}Max`, value.max);
      if (value.startDate)
        queryParams.append(`${key}StartDate`, value.startDate);
      if (value.endDate) queryParams.append(`${key}EndDate`, value.endDate);
    } else if (value) {
      queryParams.append(key, value);
    }
  });

  const { data, error, isLoading, mutate } = useSWR<{
    maintenance: MaintenanceWithRelations[];
    total: number;
  }>(`/api/maintenance?${queryParams.toString()}`, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });

  return {
    maintenance: data?.maintenance || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutateMaintenance: mutate,
  };
}

export function useFetchContracts(
  page: number,
  limit: number,
  filters: ContractFilters,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { contracts: ContractWithRelations[]; total: number }
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("sortColumn", sortColumn);
  queryParams.append("sortDirection", sortDirection);
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      if (value.min) queryParams.append(`${key}Min`, value.min);
      if (value.max) queryParams.append(`${key}Max`, value.max);
      if (value.startDate)
        queryParams.append(`${key}StartDate`, value.startDate);
      if (value.endDate) queryParams.append(`${key}EndDate`, value.endDate);
    } else if (value) {
      queryParams.append(key, value);
    }
  });

  const { data, error, isLoading, mutate } = useSWR<{
    contracts: ContractWithRelations[];
    total: number;
  }>(`/api/contracts?${queryParams.toString()}`, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });
  return {
    contracts: data?.contracts || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutateContracts: mutate,
  };
}

export function useFetchDrivers(
  page: number,
  limit: number,
  filters: DriverFilters,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { drivers: Driver[]; total: number }
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("sortColumn", sortColumn);
  queryParams.append("sortDirection", sortDirection);
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      if (value.min) queryParams.append(`${key}Min`, value.min);
      if (value.max) queryParams.append(`${key}Max`, value.max);
      if (value.startDate)
        queryParams.append(`${key}StartDate`, value.startDate);
      if (value.endDate) queryParams.append(`${key}EndDate`, value.endDate);
    } else if (value) {
      queryParams.append(key, value);
    }
  });
  const { data, error, isLoading, mutate } = useSWR<{
    drivers: Driver[];
    total: number;
  }>(`/api/drivers?${queryParams.toString()}`, fetcher, {
    fallbackData,
    revalidateOnMount: false,
  });
  return {
    drivers: data?.drivers || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutateDrivers: mutate,
  };
}

export function useFetchVehicles(
  page: number,
  limit: number,
  filters: VehicleFilters,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { vehicles: Vehicle[]; total: number }
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("sortColumn", sortColumn);
  queryParams.append("sortDirection", sortDirection);
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      if (value.min) queryParams.append(`${key}Min`, value.min);
      if (value.max) queryParams.append(`${key}Max`, value.max);
      if (value.startDate)
        queryParams.append(`${key}StartDate`, value.startDate);
      if (value.endDate) queryParams.append(`${key}EndDate`, value.endDate);
    } else if (value) {
      queryParams.append(key, value);
    }
  });
  const { data, error, isLoading, mutate } = useSWR<{
    vehicles: Vehicle[];
    total: number;
  }>(`/api/vehicles?${queryParams.toString()}`, fetcher, {
    fallbackData,
    revalidateOnMount: fallbackData ? false : true,
  });
  return {
    vehicles: data?.vehicles || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutateVehicles: mutate,
  };
}

// --- "Fetch All" Hooks for Forms ---

export function useAllContracts(fallbackData?: Contract[]) {
  const { data, error, isLoading, mutate } = useSWR<Contract[]>(
    `/api/contracts/all`,
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );
  return {
    contracts: data || [],
    isLoading,
    isError: error,
    mutateAllContracts: mutate,
  };
}

export function useAllDrivers(fallbackData?: Driver[]) {
  const { data, error, isLoading, mutate } = useSWR<Driver[]>(
    `/api/drivers/all`,
    fetcher,
    { fallbackData, revalidateOnMount: false, revalidateIfStale: false }
  );
  return {
    drivers: data || [],
    isLoading,
    isError: error,
    mutateAllDrivers: mutate,
  };
}

export function useAllVehicles(fallbackData?: Vehicle[]) {
  const { data, error, isLoading, mutate } = useSWR<Vehicle[]>(
    `/api/vehicles/all`,
    fetcher,
    { fallbackData, revalidateOnMount: false, revalidateIfStale: false }
  );
  return {
    vehicles: data || [],
    isLoading,
    isError: error,
    mutateAllVehicles: mutate,
  };
}

// --- Financial Page Hooks ---

export function useFetchRecentExpenses(
  page: number,
  limit: number,
  fallbackData?: { expenses: ExpenseWithRelations[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    expenses: ExpenseWithRelations[];
    total: number;
  }>(`/api/financial/recent-expenses?page=${page}&limit=${limit}`, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });
  return { data, isLoading, isError: error, mutate };
}

export function useFetchPendingPayments(
  page: number,
  limit: number,
  fallbackData?: { payments: FinancialPayment[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    payments: FinancialPayment[];
    total: number;
  }>(`/api/financial/pending-payments?page=${page}&limit=${limit}`, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });
  return { data, isLoading, isError: error, mutate };
}

export function useFetchPaidPayments(
  page: number,
  limit: number,
  fallbackData?: { payments: FinancialPayment[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    payments: FinancialPayment[];
    total: number;
  }>(`/api/financial/paid-payments?page=${page}&limit=${limit}`, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });
  return { data, isLoading, isError: error, mutate };
}

// --- Item by ID Hooks ---

function useFetchItemById<T>(apiPath: string, id?: string, fallbackData?: T) {
  const key = id ? `${apiPath}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    fallbackData,
    revalidateOnMount: false,
  });
  return {
    data: data ?? fallbackData,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFetchContractById(
  id?: string,
  fallbackData?: ContractWithDetails
) {
  return useFetchItemById<ContractWithDetails>(
    "/api/contracts",
    id,
    fallbackData
  );
}

export function useFetchDriverById(id?: string, fallbackData?: Driver) {
  return useFetchItemById<Driver>("/api/drivers", id, fallbackData);
}

export function useFetchVehicleById(id?: string, fallbackData?: Vehicle) {
  return useFetchItemById<Vehicle>("/api/vehicles", id, fallbackData);
}

export function useFetchMaintenanceById(
  id?: string,
  fallbackData?: MaintenanceWithRelations
) {
  return useFetchItemById<MaintenanceWithRelations>(
    "/api/maintenance",
    id,
    fallbackData
  );
}

// --- Profile Hook ---

export function useFetchProfile(fallbackData?: ProfileData | null) {
  const { data, error, isLoading, mutate } = useSWR<ProfileData | null>(
    "/api/profile",
    fetcher,
    { fallbackData, revalidateOnMount: !fallbackData, revalidateOnFocus: true }
  );
  return {
    profile: data ?? fallbackData,
    isLoading,
    isError: error,
    mutateProfile: mutate,
  };
}

// --- Report Hooks ---

export function useFetchCashFlow(fallbackData?: CashFlowReportItem[]) {
  const { data, error, isLoading, mutate } = useSWR<CashFlowReportItem[]>(
    "/api/reports/cash-flow",
    fetcher,
    { fallbackData, revalidateOnMount: !fallbackData }
  );
  return { data, isLoading, isError: error, mutate };
}

export function useFetchOverduePayments(
  fallbackData?: OverduePaymentReportItem[]
) {
  const { data, error, isLoading, mutate } = useSWR<OverduePaymentReportItem[]>(
    "/api/reports/overdue-payments",
    fetcher,
    { fallbackData, revalidateOnMount: !fallbackData }
  );
  return { data, isLoading, isError: error, mutate };
}

export function useFetchDriverSummary(
  fallbackData?: DriverSummaryReportItem[]
) {
  const { data, error, isLoading, mutate } = useSWR<DriverSummaryReportItem[]>(
    "/api/reports/driver-summary",
    fetcher,
    { fallbackData, revalidateOnMount: !fallbackData }
  );
  return { data, isLoading, isError: error, mutate };
}

export function useFetchVehiclePerformanceReport(
  fallbackData?: VehiclePerformanceReportItem[],
  enabled = true
) {
  const { data, error, isLoading, mutate } = useSWR<
    VehiclePerformanceReportItem[]
  >(enabled ? "/api/reports/vehicle-performance" : null, fetcher, {
    fallbackData,
    revalidateOnMount: !fallbackData,
  });
  return { data, isLoading, isError: error, mutate };
}

export function useFetchExpenseAnalysisReport(
  fallbackData?: ExpenseAnalysisReport,
  enabled = true
) {
  const { data, error, isLoading, mutate } = useSWR<ExpenseAnalysisReport>(
    enabled ? "/api/reports/expense-analysis" : null,
    fetcher,
    { fallbackData, revalidateOnMount: !fallbackData }
  );
  return { data, isLoading, isError: error, mutate };
}

// --- Histórico de Ativos ---

export function useFetchVehicleExpenses(vehicleId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    vehicleId ? `/api/vehicles/${vehicleId}/expenses` : null,
    fetcher
  );
  return {
    expenses: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFetchDriverPayments(driverId?: string) {
  const { data, error, isLoading, mutate } = useSWR<PaymentWithRelations[]>(
    driverId ? `/api/drivers/${driverId}/payments` : null,
    fetcher
  );
  return {
    payments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
