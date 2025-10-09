import SkeletonCard from "@/components/ui/SkeletonCard";

const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-24" />
      <SkeletonCard className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-20" />
      <SkeletonCard className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-32" />
      <SkeletonCard className="h-10 w-full" />
    </div>
    <SkeletonCard className="h-10 w-36" />
  </div>
);

export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <SkeletonCard className="h-8 w-48 mb-6" />

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <SkeletonCard className="h-6 w-1/3 mb-6 pb-4 border-b border-gray-200" />
        <FormSkeleton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <SkeletonCard className="h-6 w-1/4 mb-6 pb-4 border-b border-gray-200" />
        <FormSkeleton />
      </div>
    </div>
  );
}
