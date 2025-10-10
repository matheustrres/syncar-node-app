"use client";

import { Driver, Vehicle, Contract, Payment, Expense } from "@/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDrivers(fallbackData?: Driver[]) {
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

export function useVehicles(fallbackData?: Vehicle[]) {
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

export function useContracts(fallbackData?: Contract[]) {
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

export function usePayments(fallbackData?: Payment[]) {
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

export function useExpenses(fallbackData?: Expense[]) {
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
