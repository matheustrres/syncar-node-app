import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { prisma } from "./prisma";

interface UniqueConstraintMessages {
  [key: string]: string;
}

export function handlePrismaError(
  error: unknown,
  uniqueConstraintMessages: UniqueConstraintMessages,
  defaultErrorMessage: string
): NextResponse {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = (error.meta?.target as string[])?.[0];
    if (target && uniqueConstraintMessages[target]) {
      return NextResponse.json(
        { error: uniqueConstraintMessages[target] },
        { status: 409 }
      );
    }
  }
  return NextResponse.json({ error: defaultErrorMessage }, { status: 500 });
}

export async function checkSubscription() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return false;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return false;
  }
  return user.plan === "PROFESSIONAL";
}
