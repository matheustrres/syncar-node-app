import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const payments = await prisma.payment.findMany({
    where: { contract: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const data = await request.json();
  const newPayment = await prisma.payment.create({ data });
  return NextResponse.json(newPayment, { status: 201 });
}
