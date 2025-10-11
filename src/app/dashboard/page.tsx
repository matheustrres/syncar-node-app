import { DollarSign, TrendingUp, AlertCircle, Car } from "lucide-react";
import { getDashboardData } from "@/lib/data-access";

export default async function DashboardPage() {
  const { stats, pendingPayments } = await getDashboardData();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 relative">
          <p className="text-sm text-gray-600">Receita total</p>
          <p className="text-2xl font-bold text-gray-800">
            R$ {stats.totalRevenue.toFixed(2)}
          </p>
          <DollarSign
            className="absolute top-4 right-4 text-blue-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500 relative">
          <p className="text-sm text-gray-600">Despesas totais</p>
          <p className="text-2xl font-bold text-gray-800">
            R$ {stats.totalExpenses.toFixed(2)}
          </p>
          <TrendingUp
            className="absolute top-4 right-4 text-red-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 relative">
          <p className="text-sm text-gray-600">Lucro líquido</p>
          <p
            className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            R$ {stats.netProfit.toFixed(2)}
          </p>
          <TrendingUp
            className="absolute top-4 right-4 text-green-300"
            size={32}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500 relative">
          <p className="text-sm text-gray-600">Pagamentos atrasados</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.overduePaymentsCount}
          </p>
          <AlertCircle
            className="absolute top-4 right-4 text-orange-300"
            size={32}
          />
        </div>
      </div>

      {/* Pagamentos Pendentes e Status da Frota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna de Pagamentos Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" />
            Pagamentos pendentes
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-l-4 ${isOverdue ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{payment.driverName}</p>
                        <p className="text-sm text-gray-600">
                          {payment.vehicleInfo}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Vencimento:{" "}
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {payment.value.toFixed(2)}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-600 font-medium">
                            ATRASADO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum pagamento pendente.
              </p>
            )}
          </div>
        </div>

        {/* Coluna de Status da Frota */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Car className="text-blue-500" />
            Status da frota
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">
                Veículos alugados
              </span>
              <span className="text-2xl font-bold text-green-600">
                {stats.rentedVehiclesCount}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">
                Veículos disponíveis
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.availableVehiclesCount}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg mt-4 border-t pt-4">
              <span className="font-medium text-gray-800">
                Total de veículos
              </span>
              <span className="text-2xl font-bold text-gray-600">
                {stats.totalVehicles}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}