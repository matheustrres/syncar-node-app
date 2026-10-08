import { readFinancialFilters } from "@/lib/financial-filters";
import { NextResponse, NextRequest } from "next/server";
import { getPaidPayments } from "@/lib/data-access";
import { getFinancialPagination } from "@/lib/financial-pagination";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = getFinancialPagination(searchParams);
  const result = await getPaidPayments(page, limit, searchParams.get("search") || "", "paymentDate", "desc", readFinancialFilters(searchParams));
  return NextResponse.json(result);
}
