import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white">
        <div className="relative flex items-center justify-center w-14 h-14">
          <div className="w-14 h-14 rounded-full border-4 border-[#005CC1]/20 border-t-[#005CC1] animate-spin" />
          <Loader2 className="w-6 h-6 text-[#005CC1] animate-spin absolute" />
        </div>
        <p className="text-slate-600 font-semibold text-sm tracking-wider animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
