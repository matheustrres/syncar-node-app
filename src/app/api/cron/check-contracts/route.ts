import { NextResponse } from "next/server";
import { checkContractEndings } from "@/lib/cron-jobs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    await checkContractEndings();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during scheduled contract check:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
