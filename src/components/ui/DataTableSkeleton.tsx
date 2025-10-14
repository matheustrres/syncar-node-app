"use client";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
);

const SkeletonCell = () => (
  <div className="h-5 bg-gray-100 rounded-md relative overflow-hidden">
    <Shimmer />
  </div>
);

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
}

export default function DataTableSkeleton({
  columns,
  rows = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 w-20 bg-gray-100 rounded-md relative overflow-hidden">
                  <Shimmer />
                </div>
              </th>
            ))}
            <th className="px-6 py-3">
              <div className="h-4 w-12 bg-gray-100 rounded-md ml-auto relative overflow-hidden">
                <Shimmer />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <SkeletonCell />
                </td>
              ))}
              <td className="px-6 py-4">
                <div className="flex justify-end gap-4">
                  <div className="h-5 w-5 bg-gray-100 rounded-md relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="h-5 w-5 bg-gray-100 rounded-md relative overflow-hidden">
                    <Shimmer />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
