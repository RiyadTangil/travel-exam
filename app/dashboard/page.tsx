"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Target, 
  Users, 
  ShieldCheck, 
  FileText, 
  Building2, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Briefcase
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api/fetcher";
import { ENDPOINTS } from "@/lib/api/api-endpoints";

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: metricsResponse, isLoading } = useQuery({
    queryKey: [ENDPOINTS.CRM.METRICS.KEY],
    queryFn: () => fetcher<any>(ENDPOINTS.CRM.METRICS.URL),
  });

  const metrics = metricsResponse?.data;

  const quickLinks = [
    {
      title: "Task Manager & CRM",
      description: "Manage travel leads, track pipelines, and assign tasks.",
      href: "/dashboard/crm",
      icon: Target,
      color: "bg-sky-500/10 text-sky-600 border-sky-200",
      accent: "hover:border-sky-400 hover:shadow-sky-50",
    },
    {
      title: "Manage Users",
      description: "Create and manage system operators and employees.",
      href: "/dashboard/configuration/users",
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      accent: "hover:border-indigo-400 hover:shadow-indigo-50",
    },
    {
      title: "Roles & Permissions",
      description: "Configure granular user roles and access permissions.",
      href: "/dashboard/configuration/roles",
      icon: ShieldCheck,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      accent: "hover:border-emerald-400 hover:shadow-emerald-50",
    },
    {
      title: "Invoice Templates",
      description: "Customize layout, signatures, logos and template overrides.",
      href: "/dashboard/configuration/invoice-templates",
      icon: FileText,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      accent: "hover:border-amber-400 hover:shadow-amber-50",
    },
    {
      title: "My Company Profile",
      description: "Update company details, branding, contacts, and address.",
      href: "/dashboard/profile",
      icon: Building2,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      accent: "hover:border-rose-400 hover:shadow-rose-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <DashboardHeader />
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#005CC1] to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              {session?.user?.companyName || "Company Overview"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name || "Administrator"}
            </h1>
            <p className="text-sky-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Manage your client leads, team members, roles, and invoice configurations from your central dashboard.
            </p>
          </div>
        </div>

        {/* CRM Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Leads</span>
              <p className="text-2xl font-black text-slate-800">
                {isLoading ? "..." : (metrics?.activeCount ?? 0)}
              </p>
              <p className="text-xs text-slate-500">In pipeline</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Won Value</span>
              <p className="text-2xl font-black text-slate-800">
                {isLoading ? "..." : `৳${((metrics?.wonValue ?? 0) / 1000).toFixed(0)}k`}
              </p>
              <p className="text-xs text-emerald-600 font-medium">Closed deals</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
              <p className="text-2xl font-black text-slate-800">
                {isLoading ? "..." : `৳${((metrics?.totalPipelineValue ?? 0) / 1000).toFixed(0)}k`}
              </p>
              <p className="text-xs text-slate-500">Estimated value</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Tasks</span>
              <p className="text-2xl font-black text-slate-800">
                {isLoading ? "..." : (metrics?.todayTasksCount ?? 0)}
              </p>
              <p className="text-xs text-slate-500">Scheduled for today</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Quick Navigation Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Quick Actions & Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.accent}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl border ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#005CC1] transition-colors text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
