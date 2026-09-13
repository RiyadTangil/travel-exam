"use client";

import { useSession } from "next-auth/react";
import { AlertTriangle, Clock, AlertOctagon, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export function SubscriptionBanner() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session?.user || session.user.userType === "PLATFORM") {
    return null;
  }

  const { subscriptionEndDate, companyStatus } = session.user;

  // 1. Suspension check
  if (companyStatus === "suspended" || companyStatus === "inactive") {
    return (
      <div className="sticky top-0 z-50 w-full flex justify-center pointer-events-none drop-shadow-2xl">
        <div 
          className="pointer-events-auto bg-gradient-to-r from-red-600/0 via-red-600 to-red-800/0 backdrop-blur-md text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 w-full border-b border-red-500/30"
          style={{ clipPath: "ellipse(50% 100% at 50% 0%)" }}
        >
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 animate-pulse drop-shadow-md shrink-0" />
            <span className="font-semibold text-xs sm:text-sm drop-shadow-md text-center">
              Your account is suspended. Please contact platform administration to restore access.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionEndDate) return null;

  const endDate = new Date(subscriptionEndDate).getTime();
  const now = Date.now();
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  // 2. Expired Read-Only mode check
  if (daysRemaining <= 0) {
    return (
      <div className="sticky top-0 z-50 w-full flex justify-center pointer-events-none drop-shadow-2xl">
        <div 
          className="pointer-events-auto bg-gradient-to-r from-red-600/0 via-red-600 to-red-800/0 backdrop-blur-md text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 w-full border-b border-red-500/30"
          style={{ clipPath: "ellipse(50% 100% at 50% 0%)" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-bounce drop-shadow-md shrink-0" />
            <span className="font-semibold text-xs sm:text-sm drop-shadow-md">
              Subscription Expired — Read-Only Mode.
            </span>
          </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <a 
                href="https://wa.me/8801830799683" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2"
              >
                <Phone className="w-3 h-3" />
                <span>+880 1830799683</span>
              </a>

              <span className="hidden sm:inline text-white/40">|</span>

              <a 
                href="mailto:support@travelhisab.com"
                className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2"
              >
                <Mail className="w-3 h-3" />
                <span>support@travelhisab.com</span>
              </a>
            </div>
          {/* <Link href="/dashboard/billing" className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            Upgrade Now
          </Link> */}
        </div>
      </div>
    );
  }

  // 3. Warning phase (5 days or less)
  if (daysRemaining <= 5) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 w-full flex justify-center pointer-events-none drop-shadow-2xl"
        >
          <div 
            className="pointer-events-auto bg-gradient-to-r from-amber-500/0 via-amber-500 to-orange-600/0 backdrop-blur-md text-white flex flex-col lg:flex-row items-center justify-center gap-3 px-4 sm:px-8 py-3 sm:py-4 w-full border-b border-amber-400/30"
            style={{ clipPath: "ellipse(50% 90% at 50% 0%)" }}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-pulse drop-shadow-md shrink-0" />
              <span className="font-semibold text-xs sm:text-sm drop-shadow-md text-center">
                Your subscription ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}.
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <a 
                href="https://wa.me/8801830799683" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2"
              >
                <Phone className="w-3 h-3" />
                <span>+880 1830799683</span>
              </a>

              <span className="hidden sm:inline text-white/40">|</span>

              <a 
                href="mailto:support@travelhisab.com"
                className="px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2"
              >
                <Mail className="w-3 h-3" />
                <span>support@travelhisab.com</span>
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
