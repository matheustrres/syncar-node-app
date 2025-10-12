import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

import { handlePrismaError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName, phone } = body;
    if (!name || !email || !password || !companyName || !phone) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
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
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    return handlePrismaError(
      error,
      { email: "Este email já está em uso." },
      "Ocorreu um erro interno."
    );
  }
}
