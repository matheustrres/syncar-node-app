import SkeletonCard from "@/components/ui/SkeletonCard";
import { Plus } from "lucide-react";

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
      <SkeletonCard className="h-6 w-16" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-4">
        <SkeletonCard className="h-5 w-5" />
        <SkeletonCard className="h-5 w-5" />
      </div>
    </td>
  </tr>
);

export default function DriversSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Motoristas</h2>
        <div className="bg-gray-300 h-10 w-48 rounded-lg animate-pulse flex items-center justify-center">
          <Plus size={20} className="text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}
