"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  GraduationCap,
  ShieldCheck,
  Award,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.companyId) return;

    const fetchStats = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          axios.get("/api/candidates?pageSize=1"),
          axios.get("/api/staff?pageSize=1"),
        ]);
        setCandidateCount(cRes.data?.data?.pagination?.total || 0);
        setStaffCount(sRes.data?.data?.pagination?.total || 0);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.companyId]);

  const quickLinks = [
    {
      title: "শিক্ষার্থীর প্রোফাইল / Candidates",
      description: "নতুন শিক্ষার্থীর প্রোফাইল তৈরি করুন এবং পাসপোর্ট দিয়ে লগইন সেট করুন।",
      href: "/dashboard/candidates",
      icon: GraduationCap,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      accent: "hover:border-blue-400 hover:shadow-blue-50",
    },
    {
      title: "স্টাফ ও টিম / Staff Management",
      description: "এজেন্সি কর্মী ও পরীক্ষকদের যুক্ত করুন ও পরিচালনা করুন।",
      href: "/dashboard/staff",
      icon: Users,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      accent: "hover:border-indigo-400 hover:shadow-indigo-50",
    },
    {
      title: "আমার এজেন্সি / My Company",
      description: "কোম্পানি প্রোফাইল, লোগো এবং অফিস ঠিকানা আপডেট করুন।",
      href: "/dashboard/profile",
      icon: Building2,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      accent: "hover:border-rose-400 hover:shadow-rose-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <DashboardHeader />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10">
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              {session?.user?.companyName || "Overseas Assessment Portal"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name || "Agency Author"}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Manage abroad candidates, administer trade qualification exams, and organize your agency staff.
            </p>
          </div>
        </div>

        {/* Candidate & Assessment Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">মোট শিক্ষার্থী</span>
              <p className="text-2xl font-black text-slate-800">
                {loading ? "..." : candidateCount}
              </p>
              <p className="text-xs text-slate-500">Enrolled Candidates</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#005CC1] flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">পরীক্ষায় উত্তীর্ণ</span>
              <p className="text-2xl font-black text-emerald-600">
                0
              </p>
              <p className="text-xs text-emerald-600 font-medium">Passed Assessments</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">অপেক্ষমাণ পরীক্ষা</span>
              <p className="text-2xl font-black text-slate-800">
                {loading ? "..." : candidateCount}
              </p>
              <p className="text-xs text-slate-500">Pending Exams</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">সক্রিয় স্টাফ</span>
              <p className="text-2xl font-black text-slate-800">
                {loading ? "..." : staffCount}
              </p>
              <p className="text-xs text-slate-500">Active Agency Staff</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Quick Navigation Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">মডিউল ও অপশন / Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.accent}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3.5 rounded-xl border ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#005CC1] transition-colors text-base mb-1.5">
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
