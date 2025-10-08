import React from "react";

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div className={`bg-gray-200 animate-pulse rounded-md ${className}`} />
  );
};

export default SkeletonCard;
