import {
  getReportCashFlow,
  getReportOverduePayments,
  getReportDriverSummary,
} from "@/lib/data-access";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  const [cashFlow, overduePayments, driverSummary] = await Promise.all([
    getReportCashFlow(),
    getReportOverduePayments(),
    getReportDriverSummary(),
  ]);

  return (
    <ReportsClientPage
      initialCashFlow={cashFlow}
      initialOverduePayments={overduePayments}
      initialDriverSummary={driverSummary}
    />
  );
}
