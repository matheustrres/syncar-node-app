import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { parsePaymentJson, paymentIdSchema, paymentUpdateSchema } from "@/lib/payment-validation";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!paymentIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de pagamento inválido." }, { status: 400 });
  const parsed = await parsePaymentJson(request, paymentUpdateSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;
  const payment = await prisma.payment.findFirst({ where: { id, contract: { userId: session.user.id } } });
  if (!payment) return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  if (data.contractId) {
    const contract = await prisma.contract.findFirst({ where: { id: data.contractId, userId: session.user.id } });
    if (!contract) return NextResponse.json({ error: "Contrato não encontrado." }, { status: 400 });
  }
  const updatedPayment = await prisma.payment.update({ where: { id }, data });
  return NextResponse.json(updatedPayment);
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!paymentIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de pagamento inválido." }, { status: 400 });
  const payment = await prisma.payment.findFirst({ where: { id, contract: { userId: session.user.id } }, select: { id: true } });
  if (!payment) return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  await prisma.payment.delete({ where: { id: payment.id } });
  return NextResponse.json({ message: "Pagamento deletado" }, { status: 200 });
}
