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
  Info,
  HelpCircle
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";

import { CandidateExamView } from "@/components/candidate/candidate-exam-view";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [resultCount, setResultCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const isCandidate = session?.user?.role === "CANDIDATE";

  useEffect(() => {
    if (!session?.user?.companyId || isCandidate) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [cRes, sRes, rRes] = await Promise.all([
          axios.get("/api/candidates?pageSize=1"),
          axios.get("/api/staff?pageSize=1"),
          axios.get("/api/exam-results?limit=1"),
        ]);
        setCandidateCount(cRes.data?.data?.pagination?.total || 0);
        setStaffCount(sRes.data?.data?.pagination?.total || 0);
        setResultCount(rRes.data?.data?.total || 0);
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
      title: "পরীক্ষার ফলাফল / Exam Results",
      description: "সম্পন্ন হওয়া পরীক্ষার ফলাফল, নম্বর ও তারিখ দেখুন বা ক্লিয়ার করুন।",
      href: "/dashboard/results",
      icon: Award,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      accent: "hover:border-emerald-400 hover:shadow-emerald-50",
    },
    {
      title: "প্রশ্নাবলী এডিট / Question Bank",
      description: "সকল ট্রেডের প্রশ্নাবলি ও ছবি এডিট করুন এবং সিরিয়াল পরিবর্তন করুন।",
      href: "/dashboard/questions",
      icon: HelpCircle,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      accent: "hover:border-blue-400 hover:shadow-blue-50",
    },
    {
      title: "শিক্ষার্থীর প্রোফাইল / Candidates",
      description: "নতুন শিক্ষার্থীর প্রোফাইল তৈরি করুন এবং পাসপোর্ট দিয়ে লগইন সেট করুন।",
      href: "/dashboard/candidates",
      icon: GraduationCap,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      accent: "hover:border-purple-400 hover:shadow-purple-50",
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
    const companyId = session?.user?.companyId;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <DashboardHeader />
        </header>

        <main className="flex-1 p-4 sm:p-8  w-full mx-auto space-y-8">
          {/* Welcome Banner for Student */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
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
                <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  গন্তব্য: <strong>{targetCountry}</strong> • নির্ধারিত ট্রেড: <strong>{trade}</strong>
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
                <ShieldCheck className="h-8 w-8 text-emerald-300" />
                <div className="text-left text-xs">
                  <span className="font-bold block">সিস্টেম স্ট্যাটাস</span>
                  <span className="text-emerald-200 font-semibold">পরীক্ষার জন্য প্রস্তুত</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Portal: Safe & Modern Examination System */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8">
            <CandidateExamView
              candidateName={session?.user?.name || "শিক্ষার্থী"}
              passportNo={passportNo}
              targetCountry={targetCountry}
              candidateTrade={trade}
              companyId={companyId}
            />
          </div>

          {/* Rules & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  পরীক্ষার নিয়মাবলী / Exam Rules
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
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
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Award className="h-5 w-5 text-[#005CC1]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  সনদ ও ফলাফল নীতি / Certificate Policy
                </h3>
              </div>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  কমপক্ষে <strong>৫০% নম্বর</strong> পেলে সফলভাবে উত্তীর্ণ হিসেবে গণ্য করা হবে এবং আন্তর্জাতিক নিয়োগ প্রক্রিয়ার জন্য আপনার এজেন্সি ডিজিটাল সনদ ইস্যু করবে।
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700">
                  ⚠️ কোনো যান্ত্রিক বা ইন্টারনেট সমস্যার সম্মুখীন হলে অবিলম্বে আপনার সংশ্লিষ্ট এজেন্সির সাথে যোগাযোগ করুন।
                </div>
              </div>
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
      <main className="flex-1 p-6 sm:p-8  w-full mx-auto space-y-8">
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
                {loading ? "..." : resultCount}
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
