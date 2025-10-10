"use client";

import {
  Driver,
  Vehicle,
  Contract,
  Payment,
  Expense,
  ContractWithDetails,
} from "@/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFetchDrivers(fallbackData?: Driver[]) {
  const { data, error, isLoading, mutate } = useSWR<Driver[]>(
    "/api/drivers",
    fetcher,
    { fallbackData }
  );
  return {
    drivers: data || [],
    isLoading,
    isError: error,
    mutateDrivers: mutate,
  };
}

export function useFetchVehicles(fallbackData?: Vehicle[]) {
  const { data, error, isLoading, mutate } = useSWR<Vehicle[]>(
    "/api/vehicles",
    fetcher,
    { fallbackData }
  );
  return {
    vehicles: data || [],
    isLoading,
    isError: error,
    mutateVehicles: mutate,
  };
}

export function useFetchContracts(fallbackData?: Contract[]) {
  const { data, error, isLoading, mutate } = useSWR<Contract[]>(
    "/api/contracts",
    fetcher,
    { fallbackData }
  );
  return {
    contracts: data || [],
    isLoading,
    isError: error,
    mutateContracts: mutate,
  };
}

export function useFetchPayments(fallbackData?: Payment[]) {
  const { data, error, isLoading, mutate } = useSWR<Payment[]>(
    "/api/payments",
    fetcher,
    { fallbackData }
  );
  return {
    payments: data || [],
    isLoading,
    isError: error,
    mutatePayments: mutate,
  };
}

export function useFetchExpenses(fallbackData?: Expense[]) {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    "/api/expenses",
    fetcher,
    { fallbackData }
  );
  return {
    expenses: data || [],
    isLoading,
    isError: error,
    mutateExpenses: mutate,
  };
}

function useFetchItemById<T>(apiPath: string, id?: string, fallbackData?: T) {
  const key = id ? `${apiPath}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    fallbackData,
  });
  return {
    data,
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
