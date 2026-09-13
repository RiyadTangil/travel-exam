"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Globe, Shield, Users, BarChart3, Clock, Zap, Landmark, PlaneTakeoff, TrendingUp, ChevronRight, LayoutDashboard, ReceiptText, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] relative selection:bg-[#005CC1]/30 selection:text-[#005CC1] font-sans overflow-x-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-[#005CC1]/5 to-transparent rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-[#4099D9]/5 to-transparent rounded-full blur-[140px] animate-pulse animation-delay-3000"></div>

        {/* Animated Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* Modern Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            pointer-events-auto flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-2xl transition-all duration-500
            ${scrolled
              ? "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
              : "bg-transparent border-transparent"}
          `}
        >
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
              <Image src="/main_log_bgremoved.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:text-[#005CC1] transition-colors">
              Travel Hisab
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {['Features', 'Modules', 'Solutions', 'Support'].map((item) => (
              <Button key={item} variant="ghost" size="sm" className="rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#005CC1] hover:bg-white transition-all">
                {item}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="hidden sm:flex text-sm font-bold text-slate-600 hover:text-[#005CC1]">
                Login
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-[#005CC1] hover:bg-[#004ba0] text-white font-bold rounded-xl px-6 h-10 shadow-lg shadow-[#005CC1]/20 transition-all hover:scale-105 active:scale-95 border-0 text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005CC1]/10 text-[#005CC1] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#005CC1] animate-ping"></div>
              Enterprise Travel ERP 2.0
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight mb-8">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005CC1] to-[#4099D9]">Financial Core</span> <br />
              of Your Agency.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              Precision accounting, real-time auditing, and unified operations.
              Engineered for agencies that demand absolute accuracy and scalability.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signin">
                <Button className="h-14 px-8 bg-slate-900 hover:bg-black text-white font-bold text-lg rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-0">
                  Access Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/status-check">
                <Button variant="outline" className="h-14 px-8 border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-lg rounded-2xl transition-all">
                  Track Application
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">500+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agencies Trust Us</span>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900">1M+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Invoices Processed</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* 3D Dashboard Visualization */}
            <div className="relative z-10 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-4 transform hover:scale-[1.02] transition-transform duration-700">
              <div className="bg-slate-50 rounded-[2rem] overflow-hidden aspect-[4/3] relative flex flex-col">
                <div className="h-12 bg-white border-b border-slate-100 flex items-center px-6 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 ml-4 bg-slate-100 h-6 rounded-lg"></div>
                </div>
                <div className="flex-1 p-6 grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-24 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-center">
                      <div className="w-12 h-2 bg-slate-100 rounded mb-2"></div>
                      <div className="w-20 h-4 bg-[#005CC1]/20 rounded"></div>
                    </div>
                    <div className="h-40 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-16 h-2 bg-slate-100 rounded"></div>
                        <div className="w-4 h-4 rounded-full bg-[#4099D9]/20"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-1.5 bg-slate-50 rounded"></div>
                        <div className="w-[80%] h-1.5 bg-slate-50 rounded"></div>
                        <div className="w-[90%] h-1.5 bg-slate-50 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-full bg-slate-900 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Image src="/main_log_bgremoved.png" alt="Logo" width={100} height={100} className="drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]" />
                    </motion.div>
                    <div className="mt-4 flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/30 animate-pulse"></div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-[#005CC1]"
            >
              <TrendingUp size={40} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -bottom-10 -left-10 w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-[#4099D9]"
            >
              <Landmark size={32} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Modern Feature Grid (Bento Box Style) */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#005CC1] mb-4">Core Architecture</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Built for Performance.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 h-auto md:h-[600px]">
            {/* Main Feature */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              className="md:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col justify-between group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#005CC1]/10 rounded-2xl flex items-center justify-center text-[#005CC1] mb-8">
                  <LayoutDashboard size={28} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Centralized Command Center</h3>
                <p className="text-lg text-slate-500 font-medium max-w-md">
                  Experience a unified dashboard that connects your financial ledgers with daily operations.
                  Zero fragmentation, total control.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <div className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600">Multi-Currency</div>
                <div className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600">Real-time Sync</div>
              </div>
            </motion.div>

            {/* Secondary Feature 1 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#005CC1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#4099D9] mb-8">
                  <ReceiptText size={28} />
                </div>
                <h3 className="text-2xl font-black mb-4">Automated Billing</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Smart invoice generation with automated tax calculations and vendor mapping.
                </p>
              </div>
            </motion.div>

            {/* Secondary Feature 2 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-[#005CC1] rounded-[2.5rem] p-10 text-white flex flex-col justify-center group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8">
                <UserCog size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">RBAC Security</h3>
              <p className="text-white/80 font-medium leading-relaxed">
                Enterprise-grade role-based access control to keep your financial data secure.
              </p>
            </motion.div>

            {/* Secondary Feature 3 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col justify-center group"
            >
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-[#4099D9]/10 rounded-2xl flex items-center justify-center text-[#4099D9] mb-8">
                    <Globe size={28} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">Global Reach</h3>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Built for the international travel market. Manage visas, passports, and air tickets across borders with ease.
                  </p>
                </div>
                <div className="w-full md:w-48 h-48 bg-slate-50 rounded-3xl flex items-center justify-center p-8">
                  <PlaneTakeoff size={64} className="text-[#005CC1]/20 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 pt-24 pb-12 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-8">
              <div className="relative w-10 h-10">
                <Image src="/main_log_bgremoved.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">Travel Hisab</span>
            </Link>
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              The intelligent ERP for modern travel agencies.
              Precision-built to scale your operations and protect your margins.
            </p>
          </div>
          {/* <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Platform</h4>
            <ul className="space-y-4">
              {['Accounting', 'Operations', 'Security', 'Pricing'].map(l => (
                <li key={l}><Link href="#" className="text-slate-500 hover:text-white font-bold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-4">
              {['About', 'Careers', 'Contact', 'Blog'].map(l => (
                <li key={l}><Link href="#" className="text-slate-500 hover:text-white font-bold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div> */}
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Travel Hisab ERP. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Shield size={20} /></Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Globe size={20} /></Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Users size={20} /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
