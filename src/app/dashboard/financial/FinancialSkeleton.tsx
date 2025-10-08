"use client";

import SkeletonCard from "@/components/ui/SkeletonCard";
import { Clock, TrendingDown, CheckCircle } from "lucide-react";

const PendingItemSkeleton = () => (
  <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-gray-200">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <SkeletonCard className="h-5 w-32" />
        <SkeletonCard className="h-4 w-24" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonCard className="h-6 w-20 ml-auto" />
        <SkeletonCard className="h-4 w-28 ml-auto" />
      </div>
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-200 flex justify-between items-center">
    <div className="space-y-2">
      <SkeletonCard className="h-5 w-36" />
      <SkeletonCard className="h-4 w-28" />
    </div>
    <SkeletonCard className="h-5 w-24" />
  </div>
);

export default function FinancialSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Financeiro</h2>
        <div className="flex gap-4">
          <SkeletonCard className="h-10 w-48 rounded-lg" />
          <SkeletonCard className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* LINHA ATUALIZADA ABAIXO */}
          <div className="h-8 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-gray-300" />
            <SkeletonCard className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            <PendingItemSkeleton />
            <PendingItemSkeleton />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* LINHA ATUALIZADA ABAIXO */}
          <div className="h-8 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-gray-300" />
            <SkeletonCard className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* LINHA ATUALIZADA ABAIXO */}
        <div className="h-8 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-gray-300" />
          <SkeletonCard className="h-6 w-64" />
        </div>
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </div>
    </div>
  );
}
