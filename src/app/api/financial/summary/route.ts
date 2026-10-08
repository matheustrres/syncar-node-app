import { NextResponse } from "next/server";
import { getFinancialSummary } from "@/lib/financial-summary";
export async function GET() { return NextResponse.json(await getFinancialSummary()); }
