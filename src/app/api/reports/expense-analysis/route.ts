
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

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    const byCategory = expenses.reduce((acc, expense) => {
      const type = expense.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += expense.value;
      return acc;
    }, {} as Record<string, number>);

    const byMonth = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += expense.value;
      return acc;
    }, {} as Record<string, number>);

    const report = {
      byType: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      byMonth: Object.entries(byMonth).map(([month, value]) => ({ month, value })),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating expense analysis report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
