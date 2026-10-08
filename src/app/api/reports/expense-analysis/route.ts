import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/api-utils";
import { getDataAccessSession, getReportExpenseAnalysis } from "@/lib/data-access";

export async function GET() {
  try {
    const session = await getDataAccessSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    if (!(await checkSubscription(session.user.id))) {
      return NextResponse.json(
        { error: "Apenas usuários do plano Profissional podem acessar este recurso." },
        { status: 403 }
      );
    }
    return NextResponse.json(await getReportExpenseAnalysis());
  } catch (error) {
    console.error("Error generating expense analysis report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
