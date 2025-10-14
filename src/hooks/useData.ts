"use client";

import {
  Driver,
  Vehicle,
  Contract,
  ContractWithDetails,
  User,
  Payment,
  Expense,
  CashFlowReportItem,
  OverduePaymentReportItem,
  DriverSummaryReportItem,
  Notification,
} from "@/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Type Definitions ---

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

export type ExpenseWithRelations = Expense & {
  vehicle: { plate: string } | null;
};

// --- Paginated Hooks ---

export function useFetchContracts(
  page: number,
  limit: number,
  search: string,
  status: string,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { contracts: ContractWithRelations[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    contracts: ContractWithRelations[];
    total: number;
  }>(
    `/api/contracts?page=${page}&limit=${limit}&search=${search}&status=${status}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`,
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );
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
  search: string,
  status: string,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { drivers: Driver[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    drivers: Driver[];
    total: number;
  }>(
    `/api/drivers?page=${page}&limit=${limit}&search=${search}&status=${status}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`,
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );
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
  search: string,
  status: string,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  fallbackData?: { vehicles: Vehicle[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    vehicles: Vehicle[];
    total: number;
  }>(
    `/api/vehicles?page=${page}&limit=${limit}&search=${search}&status=${status}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`,
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );

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

export function useFetchPendingPayments(
  page: number,
  limit: number,
  fallbackData?: { payments: PaymentWithRelations[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    payments: PaymentWithRelations[];
    total: number;
  }>(`/api/financial/pending-payments?page=${page}&limit=${limit}`, fetcher, {
    fallbackData,
    revalidateOnMount: false,
  });
  return { data, isLoading, isError: error, mutate };
}

export function useFetchPaidPayments(
  page: number,
  limit: number,
  fallbackData?: { payments: PaymentWithRelations[]; total: number }
) {
  const { data, error, isLoading, mutate } = useSWR<{
    payments: PaymentWithRelations[];
    total: number;
  }>(`/api/financial/paid-payments?page=${page}&limit=${limit}`, fetcher, {
    fallbackData,
    revalidateOnMount: false,
  });
  return { data, isLoading, isError: error, mutate };
}

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
    revalidateOnMount: false,
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

// --- Profile Hook ---

export function useFetchProfile(fallbackData?: User | null) {
  const { data, error, isLoading, mutate } = useSWR<User | null>(
    "/api/profile",
    fetcher,
    { fallbackData, revalidateOnMount: false }
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
    { fallbackData, revalidateOnMount: false }
  );
  return { data, isLoading, isError: error, mutate };
}

export function useFetchOverduePayments(
  fallbackData?: OverduePaymentReportItem[]
) {
  const { data, error, isLoading, mutate } = useSWR<OverduePaymentReportItem[]>(
    "/api/reports/overdue-payments",
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );
  return { data, isLoading, isError: error, mutate };
}

export function useFetchDriverSummary(
  fallbackData?: DriverSummaryReportItem[]
) {
  const { data, error, isLoading, mutate } = useSWR<DriverSummaryReportItem[]>(
    "/api/reports/driver-summary",
    fetcher,
    { fallbackData, revalidateOnMount: false }
  );
  return { data, isLoading, isError: error, mutate };
}

// --- Notifications ---

export function useFetchNotifications() {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(
    `/api/notifications`,
    fetcher,
    { revalidateOnFocus: true } // Re-fetch when user focuses the window
  );

  return {
    notifications: data || [],
    isLoading,
    isError: error,
    mutateNotifications: mutate,
  };
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
