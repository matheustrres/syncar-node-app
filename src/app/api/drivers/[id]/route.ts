import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { normalizeString } from "@/lib/string-utils";
import { driverIdSchema, driverUpdateSchema, parseDriverJson } from "@/lib/driver-validation";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!driverIdSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de motorista inválido." }, { status: 400 });
  }
  const driver = await prisma.driver.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!driver) {
    return NextResponse.json(
      { error: "Motorista não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(driver);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!driverIdSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de motorista inválido." }, { status: 400 });
  }
  const parsed = await parseDriverJson(request, driverUpdateSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { nameNormalized: _ignoredNameNormalized, cnhValidity, ...data } = parsed.data;
  try {
    const updatedDriver = await prisma.driver.update({
      where: { id, userId: session.user.id },
      data: {
        ...data,
        ...(data.name !== undefined && { nameNormalized: normalizeString(data.name) }),
        ...(data.cnh !== undefined && { cnh: data.cnh || null }),
        ...(cnhValidity !== undefined && { cnhValidity: cnhValidity ? new Date(cnhValidity) : null }),
      },
    });
    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error(`Erro ao atualizar motorista ${id}:`, error);
    return NextResponse.json({ error: "Ocorreu um erro ao atualizar o motorista." }, { status: 500 });
  }
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
  if (!driverIdSchema.safeParse(id).success) {
    return NextResponse.json({ error: "ID de motorista inválido." }, { status: 400 });
  }
  try {
    await prisma.driver.delete({ where: { id, userId: session.user.id } });
    return NextResponse.json({ message: "Motorista deletado" }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao excluir motorista ${id}:`, error);
    return NextResponse.json({ error: "Ocorreu um erro ao excluir o motorista." }, { status: 500 });
  }
}
