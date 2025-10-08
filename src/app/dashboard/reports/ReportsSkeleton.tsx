import SkeletonCard from "@/components/ui/SkeletonCard";

export default function ReportsSkeleton() {
  return (
    <div className="animate-pulse">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Relatórios</h2>

      {/* Card Fluxo de Caixa */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Fluxo de caixa Mensal</h3>
        <div className="space-y-4">
          <SkeletonCard className="h-8 w-full" />
          <SkeletonCard className="h-8 w-full" />
          <SkeletonCard className="h-8 w-full" />
        </div>
      </div>

      {/* Card Inadimplência */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4 text-orange-700">
          Relatório de Inadimplência
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <div className="space-y-2">
                <SkeletonCard className="h-5 w-40" />
                <SkeletonCard className="h-4 w-60" />
                <SkeletonCard className="h-4 w-48" />
              </div>
              <div className="text-right space-y-2">
                <SkeletonCard className="h-6 w-24 ml-auto" />
                <SkeletonCard className="h-8 w-32 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Resumo por Motorista */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Resumo por motorista</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonCard className="h-5 w-48" />
              <SkeletonCard className="h-4 w-32" />
            </div>
            <div className="text-right space-y-2">
              <SkeletonCard className="h-4 w-20 ml-auto" />
              <SkeletonCard className="h-6 w-28 ml-auto" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonCard className="h-5 w-40" />
              <SkeletonCard className="h-4 w-36" />
            </div>
            <div className="text-right space-y-2">
              <SkeletonCard className="h-4 w-20 ml-auto" />
              <SkeletonCard className="h-6 w-24 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
