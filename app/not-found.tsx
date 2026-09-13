"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, Compass, Trees, Tent, Ghost, Map } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for the flashlight effect
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Set initial position to center of screen
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    // Add event listener
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Create the dynamic mask template for the flashlight effect
  // transparent where the torch is (revealing the background), black everywhere else
  const maskImage = useMotionTemplate`radial-gradient(circle 350px at ${smoothX}px ${smoothY}px, transparent 10%, black 100%)`;

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden cursor-crosshair selection:bg-[#005CC1]/30">
      
      {/* Background Elements (Revealed by Torch) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#005CC1]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-[#4099D9]/20 rounded-full blur-[100px]"></div>
        {/* Animated Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* Dark Forest / Lost Elements */}
        <div className="absolute inset-0 text-slate-800">
          <Trees className="absolute top-[10%] left-[10%] w-32 h-32 opacity-40" />
          <Trees className="absolute top-[5%] left-[80%] w-48 h-48 opacity-30" />
          <Trees className="absolute top-[60%] left-[5%] w-40 h-40 opacity-35" />
          <Trees className="absolute top-[70%] left-[75%] w-36 h-36 opacity-40" />
          <Trees className="absolute top-[40%] left-[85%] w-24 h-24 opacity-30" />
          
          <Compass className="absolute top-[20%] left-[35%] w-20 h-20 rotate-[-20deg] opacity-30 text-slate-700" />
          <Tent className="absolute top-[80%] left-[40%] w-24 h-24 rotate-[5deg] opacity-35 text-slate-700" />
          <Ghost className="absolute top-[30%] left-[70%] w-16 h-16 opacity-30 text-slate-600 animate-pulse" />
          <Map className="absolute top-[50%] left-[20%] w-20 h-20 rotate-[15deg] opacity-30 text-slate-700" />
          <Search className="absolute top-[85%] left-[60%] w-24 h-24 rotate-[-15deg] opacity-30 text-slate-700" />
          
          <span className="absolute bottom-[15%] right-[20%] text-slate-800 text-9xl font-black rotate-[10deg] opacity-30">?</span>
          <span className="absolute top-[25%] left-[55%] text-slate-800 text-8xl font-black rotate-[-15deg] opacity-30">!</span>
        </div>
      </div>

      {/* Main Content (Revealed by Torch) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-9xl md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tighter drop-shadow-2xl mb-2 leading-none">
            404
          </h1>
          <div className="h-1.5 w-32 bg-gradient-to-r from-[#005CC1] to-[#4099D9] mx-auto mb-8 rounded-full shadow-[0_0_20px_rgba(0,92,193,0.5)]"></div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Lost in the dark?
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-10 font-medium max-w-xl mx-auto leading-relaxed">
            The page you are looking for has vanished into the shadows. 
            Use your light to find the way back to familiar territory.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/dashboard">
              <Button className="h-14 px-8 bg-[#005CC1] hover:bg-[#004ba0] text-white font-bold text-lg rounded-2xl shadow-[0_0_40px_rgba(0,92,193,0.4)] transition-all hover:scale-105 active:scale-95 border-0 flex items-center group">
                <Home className="mr-2 h-5 w-5 group-hover:-translate-y-1 transition-transform" /> Back to Dashboard
              </Button>
            </Link>
            <Button 
              onClick={() => router.back()}
              variant="outline" 
              className="h-14 px-8 border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 font-bold text-lg rounded-2xl transition-all flex items-center group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Go Back
            </Button>
          </div>
        </motion.div>
      </div>

      {/* The Darkness Overlay with the Torch Mask */}
      {isMounted && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-[#020617]"
          style={{
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.98 }} // 0.98 so it's not pitch black, leaves a tiny hint of the background
          transition={{ duration: 2 }}
        >
          {/* Subtle hint text hidden in the dark overlay itself */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[20vw] font-black text-white/5 tracking-tighter mix-blend-overlay">404</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
