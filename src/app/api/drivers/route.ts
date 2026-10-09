import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { handlePrismaError } from "@/lib/api-utils";
import { normalizeString } from "@/lib/string-utils";
import { getRedisCache, invalidateDriverCaches, setRedisCache } from "@/lib/redis-cache";
import {
  driverCreateSchema,
  driverIdsSchema,
  driverListQuerySchema,
  parseDriverJson,
} from "@/lib/driver-validation";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  for (const key of new Set(searchParams.keys())) {
    if (searchParams.getAll(key).length > 1) {
      return NextResponse.json({ error: `Parâmetro repetido: ${key}.` }, { status: 400 });
    }
  }
  const parsed = driverListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Filtros inválidos." }, { status: 400 });
  }
  const query = parsed.data;
  const cacheKey = `syncar:cache:drivers:${session.user.id}:api:${encodeURIComponent(JSON.stringify(query))}`;
  const cachedDrivers = await getRedisCache<unknown>(cacheKey);
  if (cachedDrivers.value) return NextResponse.json(cachedDrivers.value);
  const where: Prisma.DriverWhereInput = { userId: session.user.id };
  for (const field of ["name", "cpf", "phone", "email"] as const) {
    const value = query[field];
    if (value) where[field] = { contains: value, mode: "insensitive" };
  }
  if (query.status) where.status = query.status;
  const skip = (query.page - 1) * query.limit;
  try {
    const [drivers, total] = await prisma.$transaction([
      prisma.driver.findMany({
        where,
        select: {
          id: true, name: true, cpf: true, phone: true, email: true, cnh: true,
          cnhValidity: true, cep: true, logradouro: true, numero: true,
          complemento: true, bairro: true, cidade: true, uf: true, status: true,
        },
        skip,
        take: query.limit,
        orderBy: { [query.sortColumn]: query.sortDirection },
      }),
      prisma.driver.count({ where }),
    ]);
    const result = { drivers, total };
    await setRedisCache(cacheKey, result, 15, cachedDrivers.version);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao buscar motoristas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.plan === "BASIC") {
    const driverCount = await prisma.driver.count({ where: { userId: session.user.id } });
    if (driverCount >= 3) {
      return NextResponse.json({ error: "Limite de motoristas atingido. Faça o upgrade." }, { status: 403 });
    }
  }
  const parsed = await parseDriverJson(request, driverCreateSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { nameNormalized: _ignoredNameNormalized, cnhValidity, ...data } = parsed.data;
  try {
    const newDriver = await prisma.driver.create({
      data: {
        ...data,
        userId: session.user.id,
        nameNormalized: normalizeString(data.name),
        cnh: data.cnh || null,
        cnhValidity: cnhValidity ? new Date(cnhValidity) : null,
      },
    });
    await invalidateDriverCaches(session.user.id);
    return NextResponse.json(newDriver, { status: 201 });
  } catch (error: unknown) {
    return handlePrismaError(error, {
      cpf: "O CPF informado já está em uso.",
      cnh: "A CNH informada já está em uso.",
      email: "O email informado já está em uso.",
    }, "Ocorreu um erro ao criar o motorista.");
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const parsed = await parseDriverJson(request, driverIdsSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await prisma.driver.deleteMany({ where: { id: { in: parsed.data.ids }, userId: session.user.id } });
    await invalidateDriverCaches(session.user.id);
    return NextResponse.json({ message: "Motoristas excluídos com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir motoristas:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao excluir os motoristas." }, { status: 500 });
  }
}
