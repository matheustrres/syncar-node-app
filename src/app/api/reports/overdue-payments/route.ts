import { NextResponse } from "next/server";
import { getReportOverduePayments } from "@/lib/data-access";

export async function GET() {
  const overduePayments = await getReportOverduePayments();
  return NextResponse.json(overduePayments);
}
