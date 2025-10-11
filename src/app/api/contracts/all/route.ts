import { NextResponse } from "next/server";
import { getAllContracts } from "@/lib/data-access";

export async function GET() {
  const contracts = await getAllContracts();
  return NextResponse.json(contracts);
}
