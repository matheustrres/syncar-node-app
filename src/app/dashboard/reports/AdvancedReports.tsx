"use client";

import { ResponsivePie, PieCustomLayerProps } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";

import {
  useFetchProfile,
  useFetchVehiclePerformanceReport,
  useFetchExpenseAnalysisReport,
} from "@/hooks/useData";
import UpgradePlaceholder from "@/components/ui/UpgradePlaceholder";
import AdvancedReportsSkeleton from "./AdvancedReportsSkeleton";

const theme = {
  axis: {
    ticks: {
      text: {
        fill: "#9ca3af",
      },
    },
    legend: {
      text: {
        fill: "#9ca3af",
      },
    },
  },
  legends: {
    text: {
      fill: "#9ca3af",
    },
  },
  tooltip: {
    container: {
      background: "#1f2937",
      color: "#f9fafb",
      borderRadius: "0.25rem",
    },
  },
};

const CenteredMetric = ({
  dataWithArc,
  centerX,
  centerY,
}: PieCustomLayerProps<unknown>) => {
  const total = dataWithArc.reduce((acc, datum) => acc + datum.value, 0);
  return (
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        fill: "#374151",
      }}
    >
      {new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(total)}
    </text>
  );
};

export default function AdvancedReports() {
  const { profile, isLoading: profileLoading } = useFetchProfile();
  const { data: vehiclePerformance, isLoading: vehicleLoading } =
    useFetchVehiclePerformanceReport();
  const { data: expenseAnalysis, isLoading: expenseLoading } =
    useFetchExpenseAnalysisReport();

  if (profileLoading) return <AdvancedReportsSkeleton />;

  if (profile?.plan !== "PROFESSIONAL") {
    return (
      <UpgradePlaceholder featureName="Relatórios Avançados">
        <AdvancedReportsSkeleton />
      </UpgradePlaceholder>
    );
  }

  if (vehicleLoading || expenseLoading) {
    return <AdvancedReportsSkeleton />;
  }

  const pieData =
    expenseAnalysis?.byType.map((item) => ({
      id: item.name,
      label: item.name,
      value: item.value,
    })) || [];
  const barData =
    expenseAnalysis?.byMonth.map((item) => ({
      month: item.month,
      Despesa: item.value,
    })) || [];

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Desempenho por veículo
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Despesa Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lucro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehiclePerformance?.map((item) => (
                <tr key={item.vehicleId}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {item.vehicleInfo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.totalExpenses)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-bold ${item.profit >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Análise de despesas
        </h3>
        <div className="flex flex-wrap -mx-4" style={{ height: "auto" }}>
          <div className="w-full md:w-1/2 px-4 h-96">
            <h4 className="text-md font-semibold mb-2 text-center">
              Despesas por tipo
            </h4>
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.6}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#9ca3af"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              theme={theme}
              layers={["arcs", "arcLinkLabels", "legends", CenteredMetric]}
              tooltip={({ datum }) => (
                <div className="rounded-lg border bg-background p-2 shadow-sm font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(datum.value)}
                </div>
              )}
            />
          </div>
          <div className="w-full md:w-1/2 px-4 h-96">
            <h4 className="text-md font-semibold mb-2 text-center">
              Despesas por mês
            </h4>
            <ResponsiveBar
              data={barData}
              keys={["Despesa"]}
              indexBy="month"
              margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={{ scheme: "nivo" }}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legendPosition: "middle",
                legendOffset: -40,
                format: (value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  }).format(value),
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[]}
              theme={theme}
              valueFormat={(value) =>
                `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
