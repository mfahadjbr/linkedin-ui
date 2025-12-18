"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F4F9FF] overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
