'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionButton: React.ReactNode;
}

export default function EmptyState({
  Icon,
  title,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-full">
      <Icon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      {actionButton}
    </div>
  );
}
