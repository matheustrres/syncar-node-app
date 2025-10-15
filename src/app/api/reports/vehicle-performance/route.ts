
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { checkSubscription } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const user = session.user;
    const isProfissional = await checkSubscription();
    if (!isProfissional) {
      return NextResponse.json(
        {
          error:
            "Apenas usuários do plano Profissional podem acessar este recurso.",
        },
        { status: 403 }
      );
    }
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.id },
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
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating vehicle performance report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
