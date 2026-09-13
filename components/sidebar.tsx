"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { getNavItems } from "@/lib/navigation"
import { LogoutConfirmationDialog } from "@/components/shared/logout-confirmation-dialog"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    "Configuration": pathname.startsWith("/dashboard/configuration") || pathname.startsWith("/dashboard/profile"),
    "Users": pathname.startsWith("/dashboard/configuration/users") || pathname.startsWith("/dashboard/configuration/roles"),
  })

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await signOut({ redirect: false })
    window.location.href = "/auth/signin"
  }

  // Filter items based on permissions
  const filterNavItems = (items: any[]): any[] => {
    // If there's no session or the user is not defined, we can choose to return empty or all (depending on auth guard)
    // Assuming auth guard handles login, but wait until session loads
    if (!session?.user) return [];

    // Admin bypass: if you want admin to see everything without explicit permissions
    // if (session.user.role === 'admin') return items;

    const userPerms = (session.user as any).permissions || [];

    return items.reduce((acc, item) => {
      // Create the prefix the same way navigation.tsx does
      const keyPrefix = item.href ? item.href : item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // If it's a leaf node with href
      if (item.href) {
        // We will assume 'perm-all' means full access. 
        if (userPerms.includes("perm-all")) {
          acc.push(item);
        } else {
          const prefix = `perm-${keyPrefix}`;
          const hasViewPerm = userPerms.some((p: string) => {
            // New compacted format: starts with prefix, view is the 3rd element (create-edit-view-delete)
            const match = p.match(new RegExp(`^${prefix}-(?:create|null)-(?:edit|null)-(view)-(?:delete|null)$`));
            if (match) return true;
            // Fallback for old uncompacted keys
            return p === `${prefix}-view` || p === prefix;
          });

          if (hasViewPerm) {
            acc.push(item);
          }
        }
      }
      // If it has children, recursively filter them
      else if (item.children) {
        const filteredChildren = filterNavItems(item.children);
        // Only include the parent if it has at least one visible child
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      }

      return acc;
    }, []);
  }

  const navItems = filterNavItems(getNavItems());

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div
        data-state={expanded ? "expanded" : "collapsed"}
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out peer",
          expanded ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center h-20 px-6 border-b border-slate-100 bg-slate-50/50">
            <Link href="/" className="flex items-center gap-3 group font-semibold w-full">
              <div className="relative w-8 h-8 shrink-0 transition-transform duration-500 group-hover:rotate-[360deg]">
                <Image
                  src="/main_log_bgremoved.png"
                  alt="Travel Hisab Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {expanded && (
                <span className="font-black text-slate-900 tracking-tighter text-lg whitespace-nowrap">
                  Travel <span className="text-[#005CC1]">Hisab</span>
                </span>
              )}
            </Link>
          </div>

          {/* Toggle Button (Desktop) */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -right-3 top-24 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors hidden lg:block z-50"
          >
            <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform", !expanded && "rotate-180")} />
          </button>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0

                const isParentActive = hasChildren
                  ? ((item as any).children as Array<any>).some((child) => {
                    if (child.children && Array.isArray(child.children)) {
                      return child.children.some((sub: any) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
                    }
                    if (!child.href) return false
                    const u = new URL(child.href, "http://localhost")
                    const base = u.pathname
                    if (pathname !== base) return false
                    const qs = u.searchParams
                    for (const [k, v] of qs.entries()) {
                      if (searchParams.get(k) !== v) return false
                    }
                    return true
                  })
                  : isActive((item as any).href)

                if (!hasChildren) {
                  return (
                    <Link
                      key={(item as any).href}
                      href={(item as any).href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                        isParentActive
                          ? "bg-[#005CC1]/10 text-[#005CC1] font-semibold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        !expanded && "justify-center",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className={cn(
                        "transition-colors",
                        isParentActive ? "text-[#005CC1]" : "text-slate-400 group-hover:text-slate-600"
                      )}>
                        {(item as any).icon}
                      </div>
                      {expanded && <span className="text-sm">{(item as any).title}</span>}

                      {/* Active Indicator Dot for Collapsed Mode */}
                      {isParentActive && !expanded && (
                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                      )}
                    </Link>
                  )
                }

                const open = !!openMap[(item as any).title]
                return (
                  <Collapsible
                    key={(item as any).title}
                    open={open}
                    onOpenChange={(v) => setOpenMap((m) => ({ ...m, [(item as any).title]: v }))}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          if (!expanded) {
                            e.preventDefault();
                            setExpanded(true);
                            setOpenMap({ [(item as any).title]: true });
                          } else {
                            setOpenMap(prev => {
                              const newMap: Record<string, boolean> = {};
                              newMap[(item as any).title] = !prev[(item as any).title];
                              return newMap;
                            });
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                          isParentActive
                            ? "bg-[#005CC1]/10 text-[#005CC1] font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                          !expanded && "justify-center",
                        )}
                      >
                        <div className={cn(
                          "transition-colors",
                          isParentActive ? "text-[#005CC1]" : "text-slate-400 group-hover:text-slate-600"
                        )}>
                          {(item as any).icon}
                        </div>
                        {expanded && (
                          <>
                            <span className="text-sm">{(item as any).title}</span>
                            <div className="ml-auto">
                              <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-90")} />
                            </div>
                          </>
                        )}
                        {/* Active Indicator Dot for Collapsed Mode */}
                        {isParentActive && !expanded && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {expanded && (
                      <CollapsibleContent
                        className={cn(
                          "overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out",
                          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                          "data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2",
                        )}
                      >
                        <div className="mt-1 space-y-1 pl-3">
                          {((item as any).children as Array<any>).map((child) => {
                            if (child.children && Array.isArray(child.children)) {
                              const isOpen = !!openMap[child.title]
                              return (
                                <Collapsible
                                  key={child.title}
                                  open={isOpen}
                                  onOpenChange={(v) => setOpenMap((m) => ({ ...m, [child.title]: v }))}
                                  className="pl-2"
                                >
                                  <CollapsibleTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMap(prev => {
                                          const newMap = { ...prev };
                                          newMap[child.title] = !prev[child.title];
                                          return newMap;
                                        });
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                                        isOpen
                                          ? "text-[#005CC1] font-medium"
                                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                      )}
                                    >
                                      <span className="text-sm">{child.title}</span>
                                      <div className="ml-auto">
                                        <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
                                      </div>
                                    </button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="mt-1 space-y-1 pl-3 border-l-2 border-slate-100 ml-4">
                                      {child.children.map((subChild: any) => {
                                        const active = pathname === subChild.href || pathname.startsWith(subChild.href + "?")
                                        return (
                                          <Link
                                            key={subChild.href}
                                            href={subChild.href}
                                            className={cn(
                                              "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                              active
                                                ? "bg-[#005CC1]/10 text-[#005CC1] font-semibold"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                            onClick={() => setMobileOpen(false)}
                                          >
                                            {subChild.title}
                                          </Link>
                                        )
                                      })}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )
                            }

                            const isChildActive = pathname === child.href || pathname.startsWith(child.href + "?")
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                  isChildActive
                                    ? "bg-[#005CC1]/10 text-[#005CC1] font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.title}
                              </Link>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                )
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100 space-y-1">


            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group",
                !expanded && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600" />
              {expanded && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
      />
    </>
  )
}
