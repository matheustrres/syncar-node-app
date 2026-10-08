import {
  getReportCashFlow,
  getReportOverduePayments,
  getReportDriverSummary,
  getReportVehiclePerformance,
  getReportExpenseAnalysis,
  getProfile,
} from "@/lib/data-access";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  const profile = await getProfile();
  const hasAdvancedReports = profile?.plan === "PROFESSIONAL";
  const [
    cashFlow,
    rawOverduePayments,
    driverSummary,
    vehiclePerformance,
    expenseAnalysis,
  ] = await Promise.all([
    getReportCashFlow(),
    getReportOverduePayments(),
    getReportDriverSummary(),
    hasAdvancedReports ? getReportVehiclePerformance() : Promise.resolve([]),
    hasAdvancedReports ? getReportExpenseAnalysis() : Promise.resolve({ byType: [], byMonth: [] }),
  ]);

  const overduePayments = rawOverduePayments.map((payment) => ({
    ...payment,
    daysOverdue: Number(payment.daysOverdue),
  }));

  return (
    <ReportsClientPage
      initialCashFlow={cashFlow}
      initialOverduePayments={overduePayments}
      initialDriverSummary={driverSummary}
      initialVehiclePerformance={vehiclePerformance}
      initialExpenseAnalysis={expenseAnalysis}
      initialPlan={profile?.plan ?? "BASIC"}
    />
  );
}
