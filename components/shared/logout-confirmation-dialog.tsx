"use client"

import { motion } from "framer-motion"
import { LogOut, Check, X, ShieldAlert } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

interface LogoutConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LogoutConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-8 sm:p-12 md:p-14 relative overflow-hidden text-center"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-slate-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-slate-100 rounded-full blur-3xl pointer-events-none" />

        {/* Security / Logout Header Badge */}
        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <LogOut className="h-4 w-4 text-slate-600" />
            <span>লগআউট নিশ্চিতকরণ / Logout Confirmation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            আপনি কি সিস্টেম থেকে লগআউট করতে চান?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            লগআউট করলে আপনার বর্তমান সেশন বন্ধ হবে এবং লগইন পেজে নিয়ে যাওয়া হবে
          </p>
        </div>

        {/* Grid with 2 Options: Cancel on Left (First), Confirm on Right (Second) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
          {/* Left Column (First): Cancel Action / Stay Logged In */}
          <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                সিস্টেমে থাকুন
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                যদি লগআউট করতে না চান,
                <br />
                তবে বাতিল করুন
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
            >
              <span>বাতিল করুন</span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                <X className="h-4.5 w-4.5 stroke-[2.5]" />
              </span>
            </button>
          </div>

          {/* Right Column (Second): Confirm Logout */}
          <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                সেশন সমাপ্ত করুন
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                সিস্টেম থেকে বের হতে চাইলে,
                <br />
                লগআউট নিশ্চিত করুন
              </h3>
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
            >
              <span>লগআউট করুন</span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                <Check className="h-4.5 w-4.5 stroke-[2.5]" />
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
