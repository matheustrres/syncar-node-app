"use client";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-syncar-border to-transparent" />
);

const SkeletonCell = () => (
  <div className="relative h-5 overflow-hidden rounded-md bg-syncar-surface-subtle">
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
    <div className="overflow-hidden rounded-syncar-panel border border-syncar-border bg-syncar-surface shadow-sm">
      <table className="min-w-full divide-y divide-syncar-border">
        <thead className="bg-syncar-surface-subtle">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="relative h-4 w-20 overflow-hidden rounded-md bg-syncar-surface-subtle">
                  <Shimmer />
                </div>
              </th>
            ))}
            <th className="px-6 py-3">
              <div className="relative ml-auto h-4 w-12 overflow-hidden rounded-md bg-syncar-surface-subtle">
                <Shimmer />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-syncar-border bg-syncar-surface">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <SkeletonCell />
                </td>
              ))}
              <td className="px-6 py-4">
                <div className="flex justify-end gap-4">
                  <div className="relative h-5 w-5 overflow-hidden rounded-md bg-syncar-surface-subtle">
                    <Shimmer />
                  </div>
                  <div className="relative h-5 w-5 overflow-hidden rounded-md bg-syncar-surface-subtle">
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
