"use client"; 
import { Sidebar, DashboardHeader } from "@/componentsux/dashboard/sidebar";
import LoadingAuth from "@/componentsux/dashboard/LoadingAuth";
import { useAuth } from "@/componentsux/dashboard/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const loading = useAuth();

  if (loading) {
    return <LoadingAuth />;
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
