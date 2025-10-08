import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const data = await request.json();
  const newExpense = await prisma.expense.create({
    data: { ...data, userId: session.user.id },
  });
  return NextResponse.json(newExpense, { status: 201 });
}
