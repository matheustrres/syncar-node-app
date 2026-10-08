import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { getProfile } from "@/lib/data-access";

export async function GET() {
  const user = await getProfile();
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { name, email, companyName } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        companyName,
      },
      select: { name: true, email: true, companyName: true, plan: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      const message = target.includes("email")
        ? "Este email já está em uso."
        : target.includes("company_name") || target.includes("companyName")
          ? "Este nome de empresa já está em uso."
          : "Este dado já está em uso.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar o perfil." },
      { status: 500 }
    );
  }
}
