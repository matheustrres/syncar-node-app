import SkeletonCard from "@/components/ui/SkeletonCard";
import { ArrowLeft } from "lucide-react";
import styles from "../../detailPages.module.css";

const DetailItemSkeleton = () => (
  <div className="py-2">
    <SkeletonCard className="h-4 w-24 mb-2" />
    <SkeletonCard className="h-5 w-40" />
  </div>
);

export default function VehicleDetailsSkeleton() {
  return (
    <div className={styles.skeletonPage}>
      <div className={styles.skeletonBack}>
        <ArrowLeft size={20} />
        <SkeletonCard className="h-5 w-48" />
      </div>

      <div className={styles.skeletonPanel}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <SkeletonCard className="h-8 w-64 mb-2" />
            <SkeletonCard className="h-6 w-32" />
          </div>
          <SkeletonCard className="h-8 w-24 rounded-full" />
        </div>

        <div className={styles.section}>
          <SkeletonCard className="h-7 w-56 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <DetailItemSkeleton />
            <DetailItemSkeleton />
            <DetailItemSkeleton />
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
