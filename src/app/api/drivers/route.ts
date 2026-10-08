import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { handlePrismaError } from "@/lib/api-utils";

import { normalizeString } from "@/lib/string-utils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const requestedPage = Number(searchParams.get("page"));
  const requestedLimit = Number(searchParams.get("limit"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 100)
    : 10;
  const sortableColumns = ["createdAt", "name", "cpf", "phone", "status"] as const;
  const requestedSort = searchParams.get("sortColumn");
  const sortColumn = sortableColumns.find((column) => column === requestedSort) || "createdAt";
  const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;
  const where: Prisma.DriverWhereInput = { userId: session.user.id };
  for (const field of ["name", "cpf", "phone", "email"] as const) {
    const value = searchParams.get(field);
    if (value) where[field] = { contains: value, mode: "insensitive" };
  }
  const status = searchParams.get("status");
  if (status) where.status = status;
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
  return NextResponse.json({ drivers, total });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.plan === "BASIC") {
    const driverCount = await prisma.driver.count({
      where: { userId: session.user.id },
    });
    if (driverCount >= 3) {
      return NextResponse.json(
        {
          error: "Limite de motoristas atingido. Faça o upgrade.",
        },
        { status: 403 }
      );
    }
  }
  const data = await request.json();
  try {
    const newDriver = await prisma.driver.create({
      data: {
        ...data,
        userId: session.user.id,
        nameNormalized: normalizeString(data.name),
        cnh: typeof data.cnh === "string" ? data.cnh.trim() || null : null,
        cnhValidity: data.cnhValidity ? new Date(data.cnhValidity) : null,
      },
    });
    return NextResponse.json(newDriver, { status: 201 });
  } catch (error: unknown) {
    return handlePrismaError(
      error,
      {
        cpf: "O CPF informado já está em uso.",
        cnh: "A CNH informada já está em uso.",
        email: "O email informado já está em uso.",
      },
      "Ocorreu um erro ao criar o motorista."
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "IDs inválidos fornecidos." },
      { status: 400 }
    );
  }
  try {
    await prisma.driver.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });
    return NextResponse.json(
      { message: "Motoristas excluídos com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir motoristas:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir os motoristas." },
      { status: 500 }
    );
  }
}
