import {
  Vehicle as VehicleModel,
  Driver as DriverModel,
  Contract as ContractModel,
  Payment as PaymentModel,
  Expense as ExpenseModel,
  User as UserModel,
} from "@prisma/client";

type ToJson<T> = {
  [P in keyof T]: T[P] extends Date ? string : T[P];
};

export type Vehicle = ToJson<VehicleModel>;
export type Driver = ToJson<DriverModel>;
export type Contract = ToJson<ContractModel>;
export type Payment = ToJson<PaymentModel>;
export type Expense = ToJson<ExpenseModel>;
export type User = ToJson<UserModel>;
export type ContractWithDetails = Contract & {
  driver: Driver;
  vehicle: Vehicle;
};

export type WithoutBaseItem<T> = Omit<
  T,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
