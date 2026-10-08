import { NextResponse, NextRequest } from "next/server";
import { getPendingPayments } from "@/lib/data-access";
import { getFinancialPagination } from "@/lib/financial-pagination";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getFinancialPagination(searchParams);
  const result = await getPendingPayments(page, limit);
  return NextResponse.json(result);
}
