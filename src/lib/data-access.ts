import { cache } from "react";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { Contract, Driver, User, Vehicle } from "@/types";
import {
  ContractWithRelations,
  ExpenseWithRelations,
  PaymentWithRelations,
} from "@/hooks/useData";

export const getContracts = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { contracts: [], total: 0 };
  const skip = (page - 1) * limit;
  const where = { userId: session.user.id };
  const [contracts, total] = await prisma.$transaction([
    prisma.contract.findMany({
      where,
      include: {
        driver: { select: { name: true } },
        vehicle: { select: { plate: true, model: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contract.count({ where }),
  ]);
  return { contracts, total } as unknown as {
    contracts: ContractWithRelations[];
    total: number;
  };
});

export const getAllContracts = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.contract.findMany({
    where: { userId: session.user.id, status: "Ativo" },
    select: {
      id: true,
      driverId: true,
      vehicleId: true,
      status: true,
      weeklyValue: true,
    },
  }) as unknown as Contract[];
});

export const getDrivers = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { drivers: [], total: 0 };
  const skip = (page - 1) * limit;
  const where = { userId: session.user.id };
  const [drivers, total] = await prisma.$transaction([
    prisma.driver.findMany({
      where,
      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        email: true,
        cnh: true,
        cnhValidity: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        uf: true,
        status: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.driver.count({ where }),
  ]);
  return { drivers, total } as unknown as { drivers: Driver[]; total: number };
});

export const getAllDrivers = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.driver.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  }) as unknown as Driver[];
});

export const getVehicles = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { vehicles: [], total: 0 };
  const skip = (page - 1) * limit;
  const where = { userId: session.user.id };
  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        renavam: true,
        chassis: true,
        km: true,
        status: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.count({ where }),
  ]);
  return { vehicles, total } as { vehicles: Vehicle[]; total: number };
});

export const getAllVehicles = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.vehicle.findMany({
    where: { userId: session.user.id },
    select: { id: true, plate: true, brand: true, model: true, status: true },
    orderBy: { model: "asc" },
  }) as unknown as Vehicle[];
});

// --- Financial Page Functions ---

export const getPendingPayments = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { payments: [], total: 0 };
  const where = { contract: { userId: session.user.id }, status: "Pendente" };
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      include: {
        contract: {
          select: {
            driver: { select: { name: true } },
            vehicle: { select: { plate: true, model: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { dueDate: "asc" },
    }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total } as unknown as {
    payments: PaymentWithRelations[];
    total: number;
  };
});

export const getPaidPayments = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { payments: [], total: 0 };
  const where = { contract: { userId: session.user.id }, status: "Pago" };
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      include: { contract: { select: { driver: { select: { name: true } } } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { paymentDate: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total } as unknown as {
    payments: PaymentWithRelations[];
    total: number;
  };
});

export const getRecentExpenses = cache(async (page = 1, limit = 10) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { expenses: [], total: 0 };
  const where = { userId: session.user.id };
  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      include: { vehicle: { select: { plate: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.expense.count({ where }),
  ]);
  return { expenses, total } as unknown as {
    expenses: ExpenseWithRelations[];
    total: number;
  };
});

// --- Reports --- //

export const getReportVehiclePerformance = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    include: {
      contracts: {
        include: {
          payments: true,
        },
      },
      expenses: true,
    },
  });

  const report = vehicles.map((vehicle) => {
    const totalRevenue = vehicle.contracts.reduce((sum, contract) => {
      return (
        sum +
        contract.payments.reduce((paymentSum, payment) => {
          return paymentSum + (payment.status === "Pago" ? payment.value : 0);
        }, 0)
      );
    }, 0);

    const totalExpenses = vehicle.expenses.reduce(
      (sum, expense) => sum + expense.value,
      0
    );

    return {
      vehicleId: vehicle.id,
      vehicleInfo: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
    };
  });

  return report;
});

export const getReportExpenseAnalysis = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { byType: [], byMonth: [] };

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  const byType = expenses.reduce(
    (acc, expense) => {
      const type = expense.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += expense.value;
      return acc;
    },
    {} as Record<string, number>
  );

  const byMonth = expenses.reduce(
    (acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += expense.value;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    byType: Object.entries(byType).map(([name, value]) => ({
      name,
      value,
    })),
    byMonth: Object.entries(byMonth).map(([month, value]) => ({
      month,
      value,
    })),
  };
});

export const getReportCashFlow = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const payments = await prisma.payment.findMany({
    where: {
      contract: { userId: session.user.id },
      status: "Pago",
      paymentDate: { not: null },
    },
    select: { value: true, paymentDate: true },
  });
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    select: { value: true, date: true },
  });
  const cashFlowData: {
    [key: string]: { month: string; revenue: number; expense: number };
  } = {};
  payments.forEach((p) => {
    const month = p.paymentDate!.toISOString().substring(0, 7);
    if (!cashFlowData[month])
      cashFlowData[month] = { month, revenue: 0, expense: 0 };
    cashFlowData[month].revenue += p.value;
  });
  expenses.forEach((e) => {
    const month = new Date(e.date).toISOString().substring(0, 7);
    if (!cashFlowData[month])
      cashFlowData[month] = { month, revenue: 0, expense: 0 };
    cashFlowData[month].expense += e.value;
  });
  return Object.values(cashFlowData).sort((a, b) =>
    b.month.localeCompare(a.month)
  );
});

export const getReportOverduePayments = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const overduePayments = await prisma.payment.findMany({
    where: {
      contract: { userId: session.user.id },
      status: "Pendente",
      dueDate: { lt: new Date() },
    },
    include: {
      contract: {
        include: {
          driver: { select: { name: true } },
          vehicle: { select: { plate: true, model: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
  return overduePayments.map((p) => ({
    id: p.id,
    weekStart: p.weekStart,
    weekEnd: p.weekEnd,
    dueDate: p.dueDate,
    value: p.value,
    driverName: p.contract.driver.name,
    vehicleInfo: `${p.contract.vehicle.plate} - ${p.contract.vehicle.model}`,
    daysOverdue: Math.floor(
      (new Date().getTime() - new Date(p.dueDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  }));
});

export const getReportDriverSummary = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  const [drivers, contracts, payments] = await Promise.all([
    prisma.driver.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
    prisma.contract.findMany({
      where: { userId },
      select: { id: true, driverId: true, vehicleId: true, status: true },
    }),
    prisma.payment.findMany({
      where: { contract: { userId }, status: "Pago" },
      select: { contractId: true, value: true, paymentDate: true },
    }),
  ]);
  const vehicleIds = contracts
    .map((c) => c.vehicleId)
    .filter(Boolean) as string[];
  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds } },
    select: { id: true, plate: true },
  });
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const paymentsByContract = new Map<string, number>();
  for (const payment of payments) {
    const currentTotal = paymentsByContract.get(payment.contractId) || 0;
    paymentsByContract.set(payment.contractId, currentTotal + payment.value);
  }
  return drivers.map((driver) => {
    const driverContracts = contracts.filter((c) => c.driverId === driver.id);
    const totalPaid = driverContracts.reduce(
      (sum, c) => sum + (paymentsByContract.get(c.id) || 0),
      0
    );
    const activeContract = driverContracts.find((c) => c.status === "Ativo");
    const vehicle = activeContract
      ? vehicleMap.get(activeContract.vehicleId)
      : null;
    return {
      driverId: driver.id,
      driverName: driver.name,
      totalPaid,
      vehicleInfo: vehicle ? `Veículo: ${vehicle.plate}` : "",
    };
  });
});

// --- Dashboard Page --- //
export const getDashboardData = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      stats: {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        overduePaymentsCount: 0,
        rentedVehiclesCount: 0,
        availableVehiclesCount: 0,
        totalVehicles: 0,
      },
      pendingPayments: [],
    };
  }
  const userId = session.user.id;
  const [payments, expenses, vehicles, contracts] = await Promise.all([
    prisma.payment.findMany({ where: { contract: { userId } } }),
    prisma.expense.findMany({ where: { userId } }),
    prisma.vehicle.findMany({ where: { userId } }),
    prisma.contract.findMany({
      where: { userId },
      include: {
        driver: { select: { name: true } },
        vehicle: { select: { plate: true, model: true } },
      },
    }),
  ]);
  const totalRevenue = payments
    .filter((p) => p.status === "Pago")
    .reduce((sum, p) => sum + p.value, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const overduePayments = payments.filter(
    (p) => p.status === "Pendente" && new Date(p.dueDate) < new Date()
  );
  const rentedVehiclesCount = vehicles.filter(
    (v) => v.status === "Alugado"
  ).length;
  const availableVehiclesCount = vehicles.filter(
    (v) => v.status === "Disponível"
  ).length;

  const pendingPaymentsWithDetails = payments
    .filter((p) => p.status === "Pendente")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .map((payment) => {
      const contract = contracts.find((c) => c.id === payment.contractId);
      return {
        ...payment,
        driverName: contract?.driver.name || "N/A",
        vehicleInfo: contract
          ? `${contract.vehicle.plate} - ${contract.vehicle.model}`
          : "N/A",
      };
    });
  return {
    stats: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      overduePaymentsCount: overduePayments.length,
      rentedVehiclesCount,
      availableVehiclesCount,
      totalVehicles: vehicles.length,
    },
    pendingPayments: pendingPaymentsWithDetails,
  };
});

export const getProfile = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true, plan: true },
  }) as unknown as User;
});
