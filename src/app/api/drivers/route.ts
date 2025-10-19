import { NextRequest, NextResponse } from "next/server";
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
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortColumn = searchParams.get("sortColumn") || "createdAt";
  const sortDirection = searchParams.get("sortDirection") || "desc";
  const skip = (page - 1) * limit;
  const where: { [key: string]: unknown } = { userId: session.user.id };
  // Parse advanced filters
  searchParams.forEach((value, key) => {
    if (
      key === "page" ||
      key === "limit" ||
      key === "sortColumn" ||
      key === "sortDirection"
    )
      return;
    // Text filters
    if (["name", "cpf", "phone", "email"].includes(key)) {
      if (value) {
        where[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }
    // Select filters
    if (key === "status") {
      if (value) {
        where.status = value;
      }
    }
  });
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
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (user?.plan === "BASIC") {
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
