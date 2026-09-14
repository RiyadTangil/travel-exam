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
  BookOpen,
  PlayCircle,
  AlertCircle,
  FileCheck,
  CheckCircle,
  Info
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const isCandidate = session?.user?.role === "CANDIDATE";

  useEffect(() => {
    if (!session?.user?.companyId || isCandidate) {
      setLoading(false);
      return;
    }

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
  }, [session?.user?.companyId, isCandidate]);

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
      title: " Profile",
      description: "কোম্পানি প্রোফাইল, লোগো এবং অফিস ঠিকানা আপডেট করুন।",
      href: "/dashboard/profile",
      icon: Building2,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      accent: "hover:border-rose-400 hover:shadow-rose-50",
    },
  ];

  // --------------------------------------------------------------------------
  // CANDIDATE / STUDENT DASHBOARD VIEW
  // --------------------------------------------------------------------------
  if (isCandidate) {
    const passportNo = (session?.user as any)?.passportNumber || "অনির্ধারিত";
    const targetCountry = (session?.user as any)?.targetCountry || "সকল গন্তব্য / Global";
    const trade = (session?.user as any)?.trade || "সাধারণ দক্ষতা / General Trade";
    const examStatus = (session?.user as any)?.examStatus || "READY";

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <DashboardHeader />
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Welcome Banner for Student */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10">
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                  পরীক্ষার্থী পোর্টাল / Candidate Portal
                </span>
                <span className="inline-block px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider">
                  পাসপোর্ট নং: {passportNo}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                স্বাগতম, {session?.user?.name || "শিক্ষার্থী"}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                আপনার নির্ধারিত বৈদেশিক কর্মসংস্থান দক্ষতা যাচাই পরীক্ষা দিতে প্রস্তুত থাকুন। নিচের বিবরণ পড়ে পরীক্ষা শুরু করুন।
              </p>
            </div>
          </div>

          {/* Exam Status & Action Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Exam Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#005CC1] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                    নির্ধারিত মূল্যায়ন পরীক্ষা
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    বৈদেশিক চাকরির যোগ্যতা ও ট্রেড পরীক্ষা
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Overseas Trade Qualification & Language Assessment Test
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#005CC1] flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>

              {/* Assessment Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block">গন্তব্য দেশ</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate">{targetCountry}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block">পেশা / ট্রেড</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate">{trade}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block">সময় বরাদ্দ</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">৬০ মিনিট</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block">পাস নম্বর</span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">৫০%</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/20 text-base flex items-center justify-center gap-2"
                  onClick={() => {
                    alert("আপনার পরীক্ষা মডিউলটি লোড হচ্ছে... অনুগ্রহ করে প্রস্তুত থাকুন।");
                  }}
                >
                  <PlayCircle className="h-5 w-5" />
                  পরীক্ষা শুরু করুন / Start Exam Now
                </Button>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>পরীক্ষার জন্য সিস্টেম প্রস্তুত</span>
                </div>
              </div>
            </div>

            {/* Rules & Guidelines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  পরীক্ষার নিয়মাবলী / Exam Rules
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#005CC1] mt-1.5 shrink-0" />
                  <span>একবার পরীক্ষা শুরু করার পর সময় বিরতি দেওয়া বা স্থগিত করা যাবে না।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#005CC1] mt-1.5 shrink-0" />
                  <span>সবগুলো প্রশ্নের উত্তর দেওয়া আবশ্যক। ভুল উত্তরের জন্য কোনো নম্বর কাটা যাবে না।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#005CC1] mt-1.5 shrink-0" />
                  <span>পরীক্ষা চলাকালীন ব্রাউজার রিলোড বা ব্যাক বাটন চাপবেন না।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#005CC1] mt-1.5 shrink-0" />
                  <span>সময় শেষ হলে স্বয়ংক্রিয়ভাবে পরীক্ষা সাবমিট হয়ে যাবে।</span>
                </li>
              </ul>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700">
                ⚠️ কোনো যান্ত্রিক বা ইন্টারনেট সমস্যার সম্মুখীন হলে অবিলম্বে আপনার সংশ্লিষ্ট এজেন্সির সাথে যোগাযোগ করুন।
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Award className="h-5 w-5 text-[#005CC1]" />
              <h3 className="font-bold text-slate-900 text-sm">
                পূর্ববর্তী ফলাফল ও সনদ / Past Results & Certificate
              </h3>
            </div>
            <div className="text-center py-8">
              <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">এখনো কোনো পরীক্ষা সম্পন্ন হয়নি</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                আপনি নির্ধারিত পরীক্ষাটি সম্পন্ন করার পর এখানে আপনার অর্জিত স্কোর ও সনদ দেখতে পারবেন।
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AGENCY AUTHOR / ADMIN DASHBOARD VIEW
  // --------------------------------------------------------------------------
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
