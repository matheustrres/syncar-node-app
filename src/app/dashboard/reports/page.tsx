import {
  getReportCashFlow,
  getReportOverduePayments,
  getReportDriverSummary,
  getReportVehiclePerformance,
  getReportExpenseAnalysis,
} from "@/lib/data-access";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  const [
    cashFlow,
    overduePayments,
    driverSummary,
    vehiclePerformance,
    expenseAnalysis,
  ] = await Promise.all([
    getReportCashFlow(),
    getReportOverduePayments(),
    getReportDriverSummary(),
    getReportVehiclePerformance(),
    getReportExpenseAnalysis(),
  ]);
  return (
    <ReportsClientPage
      initialCashFlow={cashFlow}
      initialOverduePayments={overduePayments}
      initialDriverSummary={driverSummary}
      initialVehiclePerformance={vehiclePerformance}
      initialExpenseAnalysis={expenseAnalysis}
    />
  );
}
