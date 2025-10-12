import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

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
