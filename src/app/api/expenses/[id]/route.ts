import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = context.params;
  const data = await request.json();
  const updatedExpense = await prisma.expense.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(updatedExpense);
}

export async function DELETE(
  _: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = context.params;
  await prisma.expense.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ message: "Despesa deletada" }, { status: 200 });
}
