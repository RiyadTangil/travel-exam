"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className={cn("pl-0 lg:pl-64 transition-all")}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
} 