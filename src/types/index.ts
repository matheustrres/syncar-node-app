import {
  Vehicle as VehicleModel,
  Driver as DriverModel,
  Contract as ContractModel,
  Payment as PaymentModel,
  Expense as ExpenseModel,
  User as UserModel,
  Notification as NotificationModel,
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
export type Notification = ToJson<NotificationModel>;
export type ContractWithDetails = Contract & {
  driver: Driver;
  vehicle: Vehicle;
};

export type WithoutBaseItem<T> = Omit<
  T,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

// --- Report Types ---

export interface CashFlowReportItem {
  month: string;
  revenue: number;
  expense: number;
}

export interface OverduePaymentReportItem {
  id: string;
  weekStart: string;
  weekEnd: string;
  dueDate: string;
  value: number;
  driverName: string;
  vehicleInfo: string;
  daysOverdue: number;
}

export interface DriverSummaryReportItem {
  driverId: string;
  driverName: string;
  totalPaid: number;
  vehicleInfo: string;
}

export interface VehiclePerformanceReportItem {
  vehicleId: string;
  vehicleInfo: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

export interface ExpenseAnalysisReport {
  byType: { name: string; value: number }[];
  byMonth: { month: string; value: number }[];
}
