"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Building2,
  Settings,
  BarChart4,
  Bell,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogoutConfirmationDialog } from "@/components/shared/logout-confirmation-dialog"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    router.push("/auth/signout")
  }

  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Companies",
      icon: <Building2 className="h-5 w-5" />,
      href: "/admin/companies",
    },
    {
      title: "Registered Agencies",
      icon: <ShieldCheck className="h-5 w-5" />,
      href: "/admin/registered-agencies",
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
    },
    {
      title: "Subscriptions",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/admin/subscriptions",
    },
    {
      title: "Analytics",
      icon: <BarChart4 className="h-5 w-5" />,
      href: "/admin/analytics",
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/notifications",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden shadow-md bg-white border-slate-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header/Logo */}
        <div className="flex items-center h-20 px-6 border-b border-slate-100 bg-slate-50/50">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 shrink-0 transition-transform duration-500 group-hover:rotate-[360deg]">
              <Image src="/main_log_bgremoved.png" alt="Logo" fill className="object-contain" />
            </div>
            {expanded && (
              <span className="font-black text-slate-900 tracking-tighter text-lg whitespace-nowrap">
                Travel <span className="text-[#005CC1]">Exam</span>
              </span>
            )}
          </Link>
        </div>

        {/* Toggle Button (Desktop) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute -right-3 top-24 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors hidden lg:block z-50"
        >
          <ChevronLeft className={cn("h-4 w-4 text-slate-400 transition-transform", !expanded && "rotate-180")} />
        </button>

        {/* Nav Items */}
        <div className="flex flex-col h-[calc(100%-80px)] py-6">
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-[#005CC1]/10 text-[#005CC1] font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className={cn(
                    "transition-colors",
                    active ? "text-[#005CC1]" : "text-slate-400 group-hover:text-slate-600"
                  )}>
                    {item.icon}
                  </div>
                  {expanded && <span className="text-sm">{item.title}</span>}
                  
                  {/* Active Indicator Dot for Collapsed Mode */}
                  {active && !expanded && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 pt-6 border-t border-slate-100 space-y-1">
            <Link
              href="/admin/help"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group",
              )}
            >
              <HelpCircle className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
              {expanded && <span className="text-sm font-medium">Help Center</span>}
            </Link>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600" />
              {expanded && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      <LogoutConfirmationDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
      />
    </>
  )
}
