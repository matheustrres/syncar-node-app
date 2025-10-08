import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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
    const exist = await prisma.user.findUnique({
      where: { email },
    });
    if (exist) {
      return NextResponse.json(
        { message: "Email já cadastrado" },
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
  } catch {
    return NextResponse.json(
      { message: "Ocorreu um erro interno." },
      { status: 500 }
    );
  }
}
