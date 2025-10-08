"use client";

import SkeletonCard from "@/components/ui/SkeletonCard";

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <SkeletonCard className="h-4 w-3/4" />
    </td>
    <td className="px-6 py-4">
      <SkeletonCard className="h-4 w-1/2" />
    </td>
    <td className="px-6 py-4">
      <SkeletonCard className="h-4 w-1/2" />
    </td>
    <td className="px-6 py-4">
      <SkeletonCard className="h-6 w-16 rounded-full" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-4">
        <SkeletonCard className="h-5 w-5 rounded-full" />
        <SkeletonCard className="h-5 w-5 rounded-full" />
      </div>
    </td>
  </tr>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <SkeletonCard className="h-5 w-36" />
        <SkeletonCard className="h-4 w-48" />
        <SkeletonCard className="h-4 w-32" />
      </div>
      <SkeletonCard className="h-6 w-16 rounded-full" />
    </div>
    <div className="border-t pt-2 flex justify-end items-center">
      <div className="flex gap-2">
        <SkeletonCard className="h-7 w-7 rounded-full" />
        <SkeletonCard className="h-7 w-7 rounded-full" />
      </div>
    </div>
  </div>
);

export default function DriversSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Motoristas
        </h2>
        <SkeletonCard className="h-10 w-10 sm:w-48 rounded-lg animate-pulse" />
      </div>

      {/* Skeleton da Tabela para Desktop */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-x-auto animate-pulse">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>

      {/* Skeleton dos Cartões para Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
