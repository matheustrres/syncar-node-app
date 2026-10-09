import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

import { handlePrismaError } from "@/lib/api-utils";
import { parseAuthJson, registrationSchema } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    const parsed = await parseAuthJson(request, registrationSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name, email, password, companyName, phone } = parsed.data;
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Este email já está em uso." },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    return handlePrismaError(
      error,
      {
        email: "Endereço de email já em uso.",
        phone: "Telefone já em uso.",
        company_name: "Nome de empresa já em uso.",
      },
      "Ocorreu um erro interno."
    );
  }
}
