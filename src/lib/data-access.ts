import { cache } from "react";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { Contract, Driver, Vehicle } from "@/types";
import {
  Prisma,
  Maintenance,
  MaintenanceType as PrismaMaintenanceType,
} from "@prisma/client";

export interface MaintenanceWithRelations extends Maintenance {
  vehicle: Pick<Vehicle, "id" | "plate" | "model">;
}

export const getDataAccessSession = cache(() => getServerSession(authOptions));

export const getMaintenance = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    type = "",
    sortColumn = "date",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getDataAccessSession();
    if (!session?.user?.id) return { maintenance: [], total: 0 };
    const skip = (page - 1) * limit;
    const where: Prisma.MaintenanceWhereInput = { userId: session.user.id };

    if (type) where.type = type as PrismaMaintenanceType;

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { vehicle: { plate: { contains: search, mode: "insensitive" } } },
        { vehicle: { model: { contains: search, mode: "insensitive" } } },
      ];
    }

    let orderBy: Prisma.MaintenanceOrderByWithRelationInput = {
      date: "desc",
    };

    if (sortColumn === "vehicle.plate") {
      orderBy = { vehicle: { plate: sortDirection } };
    } else if (sortColumn === "vehicle.model") {
      orderBy = { vehicle: { model: sortDirection } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }

    const [maintenanceData, total] = await prisma.$transaction([
      prisma.maintenance.findMany({
        where,
        include: {
          vehicle: { select: { id: true, plate: true, model: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.maintenance.count({ where }),
    ]);

    const maintenance = maintenanceData.map((m) => ({
      ...m,
      date: m.date.toISOString(),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      nextServiceDate: m.nextServiceDate
        ? m.nextServiceDate.toISOString()
        : null,
      vehicle: m.vehicle,
    }));

    return { maintenance, total };
  }
);

export const getContracts = cache(
  async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortColumn = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    const session = await getDataAccessSession();
    if (!session?.user?.id) return { contracts: [], total: 0 };
    const skip = (page - 1) * limit;
    const where: Prisma.ContractWhereInput = { userId: session.user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { driver: { name: { contains: search, mode: "insensitive" } } },
        { vehicle: { plate: { contains: search, mode: "insensitive" } } },
        { vehicle: { model: { contains: search, mode: "insensitive" } } },
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
    const [contractsData, total] = await prisma.$transaction([
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
    const contracts = contractsData.map((contract) => ({
      ...contract,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      startDate: contract.startDate.toISOString(),
    }));
    return { contracts, total };
  }
);

export const getAllContracts = cache(async () => {
  const session = await getDataAccessSession();
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
    const [driversData, total] = await prisma.$transaction([
      prisma.driver.findMany({
        where,
        select: {
          id: true,
          name: true,
          nameNormalized: true,
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
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
        skip,
        take: limit,
        orderBy: { [sortColumn]: sortDirection },
      }),
      prisma.driver.count({ where }),
    ]);
    const drivers = driversData.map((driver) => ({
      ...driver,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
      cnhValidity: driver.cnhValidity.toISOString(),
    }));
    return { drivers, total };
  }
);

export const getAllDrivers = cache(async () => {
  const session = await getDataAccessSession();
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
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { plate: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }
    const [vehiclesData, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        select: {
          id: true,
          plate: true,
          plateNormalized: true,
          brand: true,
          model: true,
          modelNormalized: true,
          year: true,
          color: true,
          renavam: true,
          chassis: true,
          km: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
        skip,
        take: limit,
        orderBy: { [sortColumn]: sortDirection },
      }),
      prisma.vehicle.count({ where }),
    ]);
    const vehicles = vehiclesData.map((vehicle) => ({
      ...vehicle,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    }));
    return { vehicles, total };
  }
);

export const getAllVehicles = cache(async () => {
  const session = await getDataAccessSession();
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
    const session = await getDataAccessSession();
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
            driver: { name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          contract: {
            vehicle: { plate: { contains: search, mode: "insensitive" } },
          },
        },
        {
          contract: {
            vehicle: { model: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }
    const [paymentsData, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          dueDate: true,
          value: true,
          paymentDate: true,
          contract: {
            select: {
              driver: { select: { name: true } },
              vehicle: { select: { plate: true, model: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortColumn]: sortDirection },
      }),
      prisma.payment.count({ where }),
    ]);
    const payments = paymentsData.map((payment) => ({
      ...payment,
      dueDate: payment.dueDate.toISOString(),
      paymentDate: payment.paymentDate
        ? payment.paymentDate.toISOString()
        : null,
    }));
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
    const session = await getDataAccessSession();
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
            driver: { name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          contract: {
            vehicle: { plate: { contains: search, mode: "insensitive" } },
          },
        },
        {
          contract: {
            vehicle: { model: { contains: search, mode: "insensitive" } },
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
    const [paymentsData, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          dueDate: true,
          value: true,
          paymentDate: true,
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
    const payments = paymentsData.map((payment) => ({
      ...payment,
      dueDate: payment.dueDate.toISOString(),
      paymentDate: payment.paymentDate
        ? payment.paymentDate.toISOString()
        : null,
    }));
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
    const session = await getDataAccessSession();
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
    let orderBy: Prisma.ExpenseOrderByWithRelationInput = { date: "desc" };
    if (sortColumn === "vehicle.plate") {
      orderBy = { vehicle: { plate: sortDirection } };
    } else {
      orderBy = { [sortColumn]: sortDirection };
    }
    const [expensesData, total] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        include: { vehicle: { select: { plate: true } } },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.expense.count({ where }),
    ]);
    const expenses = expensesData.map((expense) => ({
      ...expense,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      date: expense.date.toISOString(),
    }));
    return { expenses, total };
  }
);

// --- Reports --- //

export const getReportVehiclePerformance = cache(async () => {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const [vehicles, revenues, expenses] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId },
      select: { id: true, brand: true, model: true, plate: true },
    }),
    prisma.$queryRaw<{ vehicleId: string; total: number }[]>`
      SELECT c.vehicle_id AS "vehicleId", SUM(p.value) AS total
      FROM payments p
      JOIN contracts c ON p.contract_id = c.id
      WHERE c.user_id = ${userId} AND p.status = 'Pago'
      GROUP BY c.vehicle_id
    `,
    prisma.expense.groupBy({
      by: ["vehicleId"],
      where: { userId },
      _sum: { value: true },
    }),
  ]);

  const revenueMap = new Map<string, number>();
  revenues.forEach((r) => {
    revenueMap.set(r.vehicleId, Number(r.total));
  });

  const expenseMap = new Map<string, number>();
  expenses.forEach((e) => {
    if (e.vehicleId) {
      expenseMap.set(e.vehicleId, e._sum.value || 0);
    }
  });

  const report = vehicles.map((vehicle) => {
    const totalRevenue = revenueMap.get(vehicle.id) || 0;
    const totalExpenses = expenseMap.get(vehicle.id) || 0;
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
  const session = await getDataAccessSession();
  if (!session?.user?.id) return { byType: [], byMonth: [] };
  const userId = session.user.id;

  const [expensesByType, expensesByMonth] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { value: true },
    }),
    prisma.$queryRaw<{ month: string; value: number }[]>`
      SELECT to_char(date_trunc('month', date), 'YYYY-MM') AS month,
             SUM(value) AS value
      FROM expenses
      WHERE user_id = ${userId}
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const byType = expensesByType.map((item) => ({
    name: item.type,
    value: item._sum.value || 0,
  }));

  const byMonth = expensesByMonth.map((item) => ({
    month: item.month,
    value: Number(item.value),
  }));

  return { byType, byMonth };
});

export const getReportCashFlow = cache(async () => {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const cashFlow = await prisma.$queryRaw<
    { month: string; revenue: number; expense: number }[]
  >`
    SELECT month, SUM(revenue) AS revenue, SUM(expense) AS expense
    FROM (
      SELECT to_char(date_trunc('month', p.payment_date), 'YYYY-MM') AS month,
             SUM(p.value) AS revenue, 0::double precision AS expense
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.user_id = ${userId}
        AND p.status = 'Pago'
        AND p.payment_date IS NOT NULL
      GROUP BY 1
      UNION ALL
      SELECT to_char(date_trunc('month', e.date), 'YYYY-MM') AS month,
             0::double precision AS revenue, SUM(e.value) AS expense
      FROM expenses e
      WHERE e.user_id = ${userId}
      GROUP BY 1
    ) monthly
    GROUP BY month
    ORDER BY month
  `;
  return cashFlow.map((item) => ({
    month: item.month,
    revenue: Number(item.revenue),
    expense: Number(item.expense),
  }));
});

export const getReportOverduePayments = cache(async () => {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return [];

  const overduePayments = await prisma.$queryRaw<
    {
      id: string;
      weekStart: Date;
      weekEnd: Date;
      dueDate: Date;
      value: number;
      driverName: string;
      vehicleInfo: string;
      daysOverdue: number;
    }[]
  >`
    SELECT
      p.id,
      p.week_start AS "weekStart",
      p.week_end AS "weekEnd",
      p.due_date AS "dueDate",
      p.value,
      d.name AS "driverName",
      v.plate || ' - ' || v.model AS "vehicleInfo",
      floor(EXTRACT(EPOCH FROM (NOW() - p.due_date)) / (60 * 60 * 24)) AS "daysOverdue"
    FROM
      payments p
      JOIN contracts c ON p.contract_id = c.id
      JOIN drivers d ON c.driver_id = d.id
      JOIN vehicles v ON c.vehicle_id = v.id
    WHERE
      c.user_id = ${session.user.id}
      AND p.status = 'Pendente'
      AND p.due_date < NOW()
    ORDER BY
      p.due_date ASC
  `;

  return overduePayments;
});

export const getReportDriverSummary = cache(async () => {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const [drivers, revenues, lastContracts] = await Promise.all([
    prisma.driver.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
    prisma.$queryRaw<{ driverId: string; total: number }[]>`
      SELECT c.driver_id AS "driverId", SUM(p.value) AS total
      FROM payments p
      JOIN contracts c ON p.contract_id = c.id
      WHERE c.user_id = ${userId} AND p.status = 'Pago'
      GROUP BY c.driver_id
    `,
    prisma.$queryRaw<{ driverId: string; plate: string }[]>`
      SELECT DISTINCT ON (c.driver_id)
        c.driver_id AS "driverId", v.plate
      FROM contracts c
      JOIN vehicles v ON v.id = c.vehicle_id
      WHERE c.user_id = ${userId}
      ORDER BY c.driver_id, c.created_at DESC, c.id DESC
    `,
  ]);

  const revenueMap = new Map<string, number>();
  revenues.forEach((r) => {
    revenueMap.set(r.driverId, Number(r.total));
  });

  const vehicleInfoMap = new Map<string, string>();
  lastContracts.forEach((c) => {
    vehicleInfoMap.set(c.driverId, `Veículo: ${c.plate}`);
  });

  const report = drivers.map((driver) => {
    const totalPaid = revenueMap.get(driver.id) || 0;
    const vehicleInfo = vehicleInfoMap.get(driver.id) || "";
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
    pendingPayments,
    vehicleCounts,
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
    prisma.payment.findMany({
      where: { contract: { userId }, status: "Pendente" },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        dueDate: true,
        value: true,
        contract: {
          select: {
            driver: { select: { name: true } },
            vehicle: { select: { plate: true, model: true } },
          },
        },
      },
      take: 5, // Limit pending payments for dashboard display
    }),
    prisma.vehicle.groupBy({
      by: ["status"],
      where: { userId },
      _count: {
        status: true,
      },
    }),
  ]);

  let rentedVehiclesCount = 0;
  let availableVehiclesCount = 0;
  let totalVehicles = 0;

  for (const group of vehicleCounts) {
    const count = group._count.status;
    totalVehicles += count;
    if (group.status === "Alugado") {
      rentedVehiclesCount = count;
    } else if (group.status === "Disponível") {
      availableVehiclesCount = count;
    }
  }
  const totalRevenue = totalRevenueResult._sum.value || 0;
  const totalExpenses = totalExpensesResult._sum.value || 0;
  const netProfit = totalRevenue - totalExpenses;
  const pendingPaymentsWithDetails = pendingPayments.map((payment) => ({
    id: payment.id,
    dueDate: payment.dueDate,
    value: payment.value,
    driverName: payment.contract.driver.name,
    vehicleInfo: `${payment.contract.vehicle.plate} - ${payment.contract.vehicle.model}`,
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
  const session = await getDataAccessSession();
  if (!session?.user?.id) {
    return null;
  }
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true, plan: true },
  });
  return userProfile;
});

export const getAllNotifications = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0, total: 0 };
  }
  const whereClause = { userId: session.user.id };
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
  });
  const unreadCount = await prisma.notification.count({
    where: { ...whereClause, isRead: false },
  });

  const total = await prisma.notification.count({ where: whereClause });

  return {
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
    total,
  };
});
