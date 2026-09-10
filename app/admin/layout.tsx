"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8">
          <h2 className="font-serif text-xl text-charcoal-DEFAULT">ระบบจัดการร้านอาหาร CASA SOL</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              วันนี้: {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
