import SkeletonCard from "@/components/ui/SkeletonCard";
import { ArrowLeft } from "lucide-react";

const DetailItemSkeleton = () => (
  <div className="py-2">
    <SkeletonCard className="h-4 w-24 mb-2" />
    <SkeletonCard className="h-5 w-48" />
  </div>
);

export default function ContractDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-2 text-gray-600 mb-6">
        <ArrowLeft size={20} />
        <SkeletonCard className="h-5 w-52" />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <SkeletonCard className="h-8 w-72 mb-2" />
            <SkeletonCard className="h-6 w-40" />
          </div>
          <SkeletonCard className="h-8 w-24 rounded-full" />
        </div>

        <div className="border-t mt-6 pt-6">
          <SkeletonCard className="h-7 w-60 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItemSkeleton />
            <DetailItemSkeleton />
            <DetailItemSkeleton />
            <DetailItemSkeleton />
            <DetailItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
