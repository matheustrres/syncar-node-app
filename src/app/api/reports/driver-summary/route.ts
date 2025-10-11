import { NextResponse } from "next/server";
import { getReportDriverSummary } from "@/lib/data-access";

export async function GET() {
  const driverSummary = await getReportDriverSummary();
  return NextResponse.json(driverSummary);
}
