import { NextResponse } from "next/server";
import { getAllVehicles } from "@/lib/data-access";

export async function GET() {
  const vehicles = await getAllVehicles();
  return NextResponse.json(vehicles);
}
