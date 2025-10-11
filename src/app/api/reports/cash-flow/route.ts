import { NextResponse } from "next/server";
import { getReportCashFlow } from "@/lib/data-access";

export async function GET() {
  const cashFlow = await getReportCashFlow();
  return NextResponse.json(cashFlow);
}
