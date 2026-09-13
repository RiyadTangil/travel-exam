import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-8 animate-pulse">
          <Image
            src="/main_log_bgremoved.png"
            alt="Travel_Hisab Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#005CC1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#005CC1] font-bold text-xl tracking-wider">Loading...</p>
        </div>
      </div>
    </div>
  )
}
