"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-syncar-canvas text-syncar-text">
      <Sidebar
        isOpen={isSidebarOpen}
        isExpanded={isSidebarExpanded}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarExpanded((expanded) => !expanded)}
      />

      <div className={`transition-[margin] duration-200 ${isSidebarExpanded ? "lg:ml-64" : "lg:ml-[4.5rem]"}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
