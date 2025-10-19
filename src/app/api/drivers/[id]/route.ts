import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { normalizeString } from "@/lib/string-utils";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
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
  const data = await request.json();
  if (data.name) {
    data.nameNormalized = normalizeString(data.name);
  }
  const updatedDriver = await prisma.driver.update({
    where: { id, userId: session.user.id },
    data,
  });
  return NextResponse.json(updatedDriver);
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
  await prisma.driver.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  return NextResponse.json({ message: "Motorista deletado" }, { status: 200 });
}
