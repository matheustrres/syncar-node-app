import React from "react";

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div className={`animate-pulse rounded-md bg-syncar-surface-subtle ${className}`} />
  );
};

export default SkeletonCard;
