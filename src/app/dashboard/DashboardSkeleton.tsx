import SkeletonCard from "@/components/ui/SkeletonCard";
import { AlertCircle, Car } from "lucide-react";

const SummaryCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <SkeletonCard className="h-4 w-1/2 mb-2" />
    <SkeletonCard className="h-7 w-1/3" />
  </div>
);

const ListItemSkeleton = () => (
  <div className="p-4 rounded-lg bg-gray-50">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <SkeletonCard className="h-5 w-32" />
        <SkeletonCard className="h-4 w-40" />
        <SkeletonCard className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonCard className="h-5 w-20 ml-auto" />
        <SkeletonCard className="h-3 w-16 ml-auto" />
      </div>
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <SkeletonCard className="h-8 w-64 mb-6" />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>

      {/* Pagamentos Pendentes e Status da Frota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna de Pagamentos Pendentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-400">
            <AlertCircle />
            Pagamentos Pendentes
          </h3>
          <div className="space-y-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>

        {/* Coluna de Status da Frota */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-400">
            <Car />
            Status da Frota
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <SkeletonCard className="h-5 w-32" />
              <SkeletonCard className="h-7 w-10" />
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <SkeletonCard className="h-5 w-40" />
              <SkeletonCard className="h-7 w-10" />
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg mt-4 border-t pt-4">
              <SkeletonCard className="h-5 w-28" />
              <SkeletonCard className="h-7 w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
