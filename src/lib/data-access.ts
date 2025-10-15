import { cache } from "react";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { Contract, Driver, User, Vehicle } from "@/types";
import { Prisma } from "@prisma/client";

export const getContracts = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortColumn = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { contracts: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.ContractWhereInput = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          driver: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          vehicle: {
            plate: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          vehicle: {
            model: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    let orderBy: Prisma.ContractOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (sortColumn === "driver.name") {
      orderBy = { driver: { name: sortDirection } };
    } else if (sortColumn === "vehicle.plate") {
      orderBy = { vehicle: { plate: sortDirection } };
    } else if (sortColumn === "vehicle.model") {
      orderBy = { vehicle: { model: sortDirection } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }

    const [contracts, total] = await prisma.$transaction([
      prisma.contract.findMany({
        where,
        include: {
          driver: { select: { name: true } },
          vehicle: { select: { plate: true, model: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.contract.count({ where }),
    ]);

    return { contracts, total };
  }
);

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

export const getDrivers = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortColumn = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { drivers: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.DriverWhereInput = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

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
        orderBy: { [sortColumn]: sortDirection },
      }),
      prisma.driver.count({ where }),
    ]);

    return { drivers, total };
  }
);

export const getAllDrivers = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.driver.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  }) as unknown as Driver[];
});

export const getVehicles = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortColumn = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { vehicles: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.VehicleWhereInput = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

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
        orderBy: { [sortColumn]: sortDirection },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { vehicles, total };
  }
);

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

export const getPendingPayments = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    sortColumn = "dueDate",
    sortDirection: "asc" | "desc" = "asc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { payments: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.PaymentWhereInput = {
      contract: { userId: session.user.id },
      status: "Pendente",
    };

    if (search) {
      where.OR = [
        {
          contract: {
            driver: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          contract: {
            vehicle: {
              plate: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          contract: {
            vehicle: {
              model: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.PaymentOrderByWithRelationInput = {
      dueDate: "asc",
    };
    if (sortColumn === "driver.name") {
      orderBy = { contract: { driver: { name: sortDirection } } };
    } else if (sortColumn === "vehicle.plate") {
      orderBy = { contract: { vehicle: { plate: sortDirection } } };
    } else if (sortColumn === "vehicle.model") {
      orderBy = { contract: { vehicle: { model: sortDirection } } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }

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
        skip,
        take: limit,
        orderBy,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }
);

export const getPaidPayments = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    sortColumn = "paymentDate",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { payments: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.PaymentWhereInput = {
      contract: { userId: session.user.id },
      status: "Pago",
    };

    if (search) {
      where.OR = [
        {
          contract: {
            driver: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          contract: {
            vehicle: {
              plate: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          contract: {
            vehicle: {
              model: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.PaymentOrderByWithRelationInput = {
      paymentDate: "desc",
    };
    if (sortColumn === "driver.name") {
      orderBy = { contract: { driver: { name: sortDirection } } };
    } else if (sortColumn === "vehicle.plate") {
      orderBy = { contract: { vehicle: { plate: sortDirection } } };
    } else if (sortColumn === "vehicle.model") {
      orderBy = { contract: { vehicle: { model: sortDirection } } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }

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
        skip,
        take: limit,
        orderBy,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }
);

export const getRecentExpenses = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    sortColumn = "date",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { expenses: [], total: 0 };

    const skip = (page - 1) * limit;
    const where: Prisma.ExpenseWhereInput = { userId: session.user.id };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vehicle: { plate: { contains: search, mode: "insensitive" } } },
      ];
    }

    let orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      date: "desc",
    };
    if (sortColumn === "vehicle.plate") {
      orderBy = { vehicle: { plate: sortDirection } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }

    const [expenses, total] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        include: { vehicle: { select: { plate: true } } },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total };
  }
);

// --- Reports --- //

export const getReportVehiclePerformance = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const vehiclePerformance = await prisma.vehicle.findMany({
    where: { userId },
    select: {
      id: true,
      brand: true,
      model: true,
      plate: true,
      contracts: {
        select: {
          payments: {
            where: { status: "Pago" },
            select: { value: true },
          },
        },
      },
      expenses: {
        select: { value: true },
      },
    },
  });

  const report = vehiclePerformance.map((vehicle) => {
    const totalRevenue = vehicle.contracts.reduce((sum, contract) => {
      return (
        sum +
        contract.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.value,
          0
        )
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

  const userId = session.user.id;

  const expensesByType = await prisma.expense.groupBy({
    by: ["type"],
    where: { userId },
    _sum: {
      value: true,
    },
  });

  const expensesByMonth = await prisma.expense.groupBy({
    by: ["date"],
    where: { userId },
    _sum: {
      value: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const byType = expensesByType.map((item) => ({
    name: item.type,
    value: item._sum.value || 0,
  }));

  const byMonth = expensesByMonth.map((item) => ({
    month: new Date(item.date).toISOString().slice(0, 7),
    value: item._sum.value || 0,
  }));

  return {
    byType,
    byMonth,
  };
});

export const getReportCashFlow = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const monthlyRevenue = await prisma.payment.groupBy({
    by: ["paymentDate"],
    where: {
      contract: { userId },
      status: "Pago",
      paymentDate: { not: null },
    },
    _sum: {
      value: true,
    },
  });

  const monthlyExpenses = await prisma.expense.groupBy({
    by: ["date"],
    where: { userId },
    _sum: {
      value: true,
    },
  });

  const cashFlowData: {
    [key: string]: { month: string; revenue: number; expense: number };
  } = {};

  monthlyRevenue.forEach((item) => {
    const month = item.paymentDate!.toISOString().substring(0, 7);
    if (!cashFlowData[month]) {
      cashFlowData[month] = { month, revenue: 0, expense: 0 };
    }
    cashFlowData[month].revenue += item._sum.value || 0;
  });

  monthlyExpenses.forEach((item) => {
    const month = item.date.toISOString().substring(0, 7);
    if (!cashFlowData[month]) {
      cashFlowData[month] = { month, revenue: 0, expense: 0 };
    }
    cashFlowData[month].expense += item._sum.value || 0;
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

  const driverSummaries = await prisma.driver.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      contracts: {
        select: {
          vehicle: {
            select: { plate: true },
          },
          payments: {
            where: { status: "Pago" },
            select: { value: true },
          },
        },
      },
    },
  });

  const report = driverSummaries.map((driver) => {
    const totalPaid = driver.contracts.reduce((sum, contract) => {
      return (
        sum +
        contract.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.value,
          0
        )
      );
    }, 0);

    const activeContract = driver.contracts.find((c) => c.payments.length > 0); // Assuming an active contract has payments
    const vehicleInfo = activeContract?.vehicle?.plate
      ? `Veículo: ${activeContract.vehicle.plate}`
      : "";

    return {
      driverId: driver.id,
      driverName: driver.name,
      totalPaid,
      vehicleInfo,
    };
  });

  return report;
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

  const [
    totalRevenueResult,
    totalExpensesResult,
    overduePaymentsCount,
    rentedVehiclesCount,
    availableVehiclesCount,
    totalVehicles,
    pendingPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { contract: { userId }, status: "Pago" },
      _sum: { value: true },
    }),
    prisma.expense.aggregate({
      where: { userId },
      _sum: { value: true },
    }),
    prisma.payment.count({
      where: {
        contract: { userId },
        status: "Pendente",
        dueDate: { lt: new Date() },
      },
    }),
    prisma.vehicle.count({
      where: { userId, status: "Alugado" },
    }),
    prisma.vehicle.count({
      where: { userId, status: "Disponível" },
    }),
    prisma.vehicle.count({
      where: { userId },
    }),
    prisma.payment.findMany({
      where: { contract: { userId }, status: "Pendente" },
      orderBy: { dueDate: "asc" },
      include: {
        contract: {
          select: {
            driver: { select: { name: true } },
            vehicle: { select: { plate: true, model: true } },
          },
        },
      },
      take: 5, // Limit pending payments for dashboard display
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.value || 0;
  const totalExpenses = totalExpensesResult._sum.value || 0;
  const netProfit = totalRevenue - totalExpenses;

  const pendingPaymentsWithDetails = pendingPayments.map((payment) => ({
    ...payment,
    driverName: payment.contract.driver.name || "N/A",
    vehicleInfo: payment.contract
      ? `${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`
      : "N/A",
  }));

  return {
    stats: {
      totalRevenue,
      totalExpenses,
      netProfit,
      overduePaymentsCount,
      rentedVehiclesCount,
      availableVehiclesCount,
      totalVehicles,
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
