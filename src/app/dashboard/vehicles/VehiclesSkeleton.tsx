import SkeletonCard from "@/components/ui/SkeletonCard";

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <SkeletonCard className="h-4 w-24" />
    </td>
    <td className="px-6 py-4">
      <SkeletonCard className="h-4 w-3/4" />
    </td>
    <td className="px-6 py-4">
      <SkeletonCard className="h-6 w-20 rounded-full" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-4">
        <SkeletonCard className="h-5 w-5 rounded-full" />
        <SkeletonCard className="h-5 w-5 rounded-full" />
      </div>
    </td>
  </tr>
);

export default function VehiclesSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Veículos</h2>
        <div className="bg-gray-200 h-10 w-44 rounded-lg animate-pulse" />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Modelo
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
