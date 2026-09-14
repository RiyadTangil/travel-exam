"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Globe2,
  ShieldCheck,
  GraduationCap,
  Users,
  Timer,
  FileCheck2,
  Laptop,
  AlertTriangle,
  Building2,
  Lock,
  ChevronRight,
  FileText,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative selection:bg-[#005CC1]/20 selection:text-[#005CC1] font-sans overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-br from-[#005CC1]/10 to-transparent rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#0284C7]/10 to-transparent rounded-full blur-[140px]"></div>
      </div>

      {/* Modern Floating Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4 pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            pointer-events-auto flex items-center justify-between w-full max-w-6xl px-6 py-3.5 rounded-2xl transition-all duration-300
            ${scrolled
              ? "bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5"
              : "bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm"}
          `}
        >
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
              <Image src="/main_log_bgremoved.png" alt="Travel Exam" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                Travel<span className="text-[#005CC1]">Exam</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Abroad Candidate Portal
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50 text-xs font-semibold text-slate-600">
            <a href="#instructions" className="px-3 py-1.5 rounded-lg hover:text-[#005CC1] hover:bg-white transition-all">
              Exam Instructions
            </a>
            <a href="#rules" className="px-3 py-1.5 rounded-lg hover:text-[#005CC1] hover:bg-white transition-all">
              Guidelines & Rules
            </a>
            <a href="#destinations" className="px-3 py-1.5 rounded-lg hover:text-[#005CC1] hover:bg-white transition-all">
              Abroad Countries
            </a>
            <a href="#agencies" className="px-3 py-1.5 rounded-lg hover:text-[#005CC1] hover:bg-white transition-all">
              For Agencies (SaaS)
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-xs font-bold text-slate-700 hover:text-[#005CC1]">
                Agency Login
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-[#005CC1] hover:bg-[#004ba0] text-white text-xs font-bold rounded-xl px-5 h-9 shadow-md shadow-[#005CC1]/20 transition-transform active:scale-95">
                Candidate Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#005CC1] text-xs font-bold tracking-wide mb-6 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#005CC1] animate-ping" />
          Official Abroad Candidate Assessment & Certification Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto"
        >
          Verify Your Skills for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9]">
            Overseas Employment & Visas
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 font-normal max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A unified SaaS assessment system for recruitment agencies, training centers, and candidate job seekers. Log in with your <strong>Passport Number</strong>, <strong>Name</strong>, or <strong>Email</strong> to begin your exam.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <Link href="/auth/signin" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-13 px-8 bg-[#005CC1] hover:bg-[#004ba0] text-white font-bold text-base rounded-xl shadow-xl shadow-[#005CC1]/25 transition-all hover:scale-105 active:scale-95">
              <GraduationCap className="mr-2.5 h-5 w-5" />
              Candidate Exam Login
            </Button>
          </Link>
          <Link href="/auth/signin" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-13 px-7 bg-white hover:bg-slate-50 border-slate-300 text-slate-800 font-bold text-base rounded-xl shadow-sm hover:scale-105 transition-all">
              <Building2 className="mr-2 h-5 w-5 text-slate-500" />
              Agency Portal
            </Button>
          </Link>
        </motion.div>

        {/* Quick helper tag */}
        <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Single-field login: candidates can sign in with their registered Passport Number</span>
        </div>
      </section>

      {/* Step-by-Step Instructions Section */}
      <section id="instructions" className="py-16 px-6 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#005CC1]">Exam Readiness</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
              Candidate Examination Instructions
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Follow these simple steps before starting your overseas trade or qualification examination.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005CC1] flex items-center justify-center font-black text-lg">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base">Sign In With Passport</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Go to the login portal. Enter your <strong>Passport Number</strong>, <strong>Full Name</strong>, or <strong>Email</strong>. If your agency didn't set a custom password, your default password is your Passport Number.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Auto-Verified Identity
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005CC1] flex items-center justify-center font-black text-lg">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">System & Device Check</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Take the exam on a laptop, desktop, or tablet with a steady internet connection. Ensure your webcam is enabled if your agency configured video proctoring.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Laptop className="h-3.5 w-3.5 text-blue-500" /> Stable Connection
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005CC1] flex items-center justify-center font-black text-lg">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">Answer Questions & Time</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Each test consists of Multiple Choice Questions (MCQ) aligned with your trade category and destination country. Monitor the exam countdown timer on your screen.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Timer className="h-3.5 w-3.5 text-blue-500" /> Timed Assessment
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005CC1] flex items-center justify-center font-black text-lg">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-base">Instant Qualification Report</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upon final submission, your score is calculated immediately. Successful candidates receive a verified digital certificate downloadable for visa and embassy clearance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified Certificate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules and Anti-Cheating Guidelines */}
      <section id="rules" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Strict Exam Conduct Rules
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Candidate Code of Integrity
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To maintain the credibility of certificates recognized by foreign recruitment bodies and embassies, every candidate must adhere to the following rules:
            </p>

            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Do not refresh the page or switch browser tabs once the exam has begun.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sit in a well-lit room without secondary individuals present.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>No headphones, smart watches, or external assistance devices are allowed.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Submit all answers before the timer reaches 00:00 to avoid auto-submission.</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/auth/signin">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm px-6 h-11 rounded-xl">
                  Proceed to Candidate Login <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Target Abroad Countries & Trade Modules */}
      <section id="destinations" className="py-16 px-6 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#005CC1]">Destination Assessment</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Target Countries & Trade Categories
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Curated exam tracks matching specific government and embassy labor requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { country: "Saudi Arabia (KSA)", desc: "Qiwa & Takamol Skill Verification Program standards for technical trades." },
              { country: "United Arab Emirates", desc: "MOHRE competency benchmarks for hospitality, transport, and facility operations." },
              { country: "Qatar & Kuwait", desc: "Labor ministry pre-departure readiness and English/Arabic communication tests." },
              { country: "European Union (Romania, Poland, Italy)", desc: "Technical workmanship assessment and European work permit qualification." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-colors">
                <Globe2 className="h-6 w-6 text-[#005CC1] mb-2.5" />
                <h4 className="font-bold text-slate-900 text-sm">{item.country}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Multi-tenant Agency Section */}
      <section id="agencies" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#005CC1] text-xs font-bold">
              <Building2 className="h-3.5 w-3.5" />
              SaaS For Overseas Recruitment Agencies
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Manage Candidates & Administer Exams Under Your Own Agency
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Are you an overseas recruiting agency or technical training school? TravelExam provides a complete SaaS infrastructure. Create candidate profiles with single-click passport numbers, assign exam categories, monitor live test results, and issue branded certificates.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/auth/signin">
                <Button className="bg-[#005CC1] hover:bg-[#004ba0] text-white font-bold text-sm px-6 h-11 rounded-xl">
                  Agency Portal Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Agency Benefits
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                Zero complex role hierarchy — fast candidate enrollment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                Passport-based auto credentials for candidates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                Automated grading & certificate generation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005CC1]" />
                Multi-tenant data isolation and privacy
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">TravelExam</span>
            <span>— Abroad Candidate Assessment & Certification SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Candidate Login
            </Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Agency Author Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
