import { NextResponse, NextRequest } from "next/server";
import { getPaidPayments } from "@/lib/data-access";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const result = await getPaidPayments(page, limit);
  return NextResponse.json(result);
}
