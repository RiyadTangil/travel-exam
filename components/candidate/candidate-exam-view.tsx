"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  Check, 
  X, 
  Sparkles,
  ShieldCheck,
  FileCheck,
  BookOpen,
  ArrowRight,
  Loader2,
  Maximize2,
  Minimize2,
  LogOut,
  Layers,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Modal, message } from "antd"
import { createPortal } from "react-dom"
import realExamData from "@/data/real-exam-questions.json"

interface CategoryItem {
  id: string
  name: string
  code?: string
  color?: string
  questionCount?: number
}

interface QuestionItem {
  id?: string
  setId?: string
  categoryName?: string
  questionText: string
  imageUrl?: string
  type?: string
  options: Array<{ key: string; text: string }>
  correctAnswer: string
  marks?: number
  difficulty?: string
  explanation?: string
}

function QuestionImage({ src, alt }: { src: string; alt: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset when source changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setIsPreviewOpen(false)
    setZoomScale(1)
    setRotation(0)
  }, [src])

  // Handle ESC key to close preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreviewOpen) {
        setIsPreviewOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPreviewOpen])

  const handleOpenPreview = () => {
    setZoomScale(1)
    setRotation(0)
    setIsPreviewOpen(true)
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale((prev) => Math.min(prev + 0.3, 3.5))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale((prev) => Math.max(prev - 0.3, 0.6))
  }

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale(1)
    setRotation(0)
  }

  return (
    <>
      <div className="rounded-2xl border-2 border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/50 p-3 sm:p-4 max-w-lg mx-auto w-full shadow-xs transition-all hover:border-blue-300">
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200/60 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5 text-slate-800">
            <ImageIcon className="h-4 w-4 text-[#005CC1]" />
            <span>চিত্র / প্রশ্ন সম্পর্কিত ছবি</span>
          </span>
          <button
            type="button"
            onClick={handleOpenPreview}
            className="text-[11px] text-[#005CC1] hover:text-[#004799] font-bold flex items-center gap-1.5 hover:underline cursor-pointer bg-blue-50/80 hover:bg-blue-100/80 px-2 py-1 rounded-md transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>বড় করে দেখতে ক্লিক করুন</span>
          </button>
        </div>

        <div 
          onClick={handleOpenPreview}
          className="w-full rounded-xl bg-white border border-slate-200/70 flex flex-col items-center justify-center overflow-hidden p-2.5 shadow-2xs group relative min-h-[220px] cursor-pointer"
        >
          {/* Animated Skeleton / Loader while fetching */}
          {isLoading && !hasError && (
            <div className="w-full h-56 sm:h-64 rounded-lg bg-slate-100/90 border border-slate-200/50 flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="p-3 rounded-full bg-white text-[#005CC1] shadow-xs border border-slate-200/80">
                <Loader2 className="h-7 w-7 animate-spin text-[#005CC1]" />
              </div>
              <div className="space-y-1 text-center px-4">
                <span className="text-xs font-bold text-slate-700 block">ছবি লোড হচ্ছে...</span>
                <span className="text-[11px] text-slate-400 block">অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন</span>
              </div>
            </div>
          )}

          {/* Error Fallback */}
          {hasError && (
            <div className="w-full h-44 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">ছবি লোড করা সম্ভব হয়নি</span>
            </div>
          )}

          {/* Image Display with Hover Overlay */}
          {!hasError && (
            <div className={cn("w-full flex items-center justify-center relative", isLoading ? "opacity-0 absolute pointer-events-none" : "opacity-100")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{ maxHeight: 320, maxWidth: "100%", objectFit: "contain" }}
                className="rounded-lg transition-transform duration-300 group-hover:scale-[1.02] mx-auto block"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />

              {/* Hover Mask */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold bg-black/75 px-3.5 py-1.5 rounded-full backdrop-blur-xs shadow-lg">
                  <Maximize2 className="h-3.5 w-3.5 text-blue-300" />
                  <span>পূর্ণ আকারে দেখতে ক্লিক করুন</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 z-[99999] flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md select-none"
            >
              {/* Top Navigation & Tool Bar */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-4xl flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-2xl"
              >
                <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-bold truncate">
                  <ImageIcon className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="truncate">{alt || "প্রশ্ন সম্পর্কিত চিত্র"}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="জুম ইন (+)"
                    className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="জুম আউট (-)"
                    className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    title="ঘোরান (Rotate 90°)"
                    className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="রিসেট"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    ১০০%
                  </button>
                  <div className="h-5 w-px bg-slate-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    title="বন্ধ করুন (Esc)"
                    className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-500/40 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Image Container */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-4 my-2"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative max-h-full max-w-full flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt}
                    style={{
                      transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease-out",
                      maxHeight: "75vh",
                      maxWidth: "90vw",
                      objectFit: "contain",
                    }}
                    className="rounded-xl shadow-2xl drop-shadow-2xl select-none pointer-events-auto"
                  />
                </motion.div>
              </div>

              {/* Bottom Hint */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="text-center text-[12px] text-slate-400 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800"
              >
                <span>জুম করতে টুলবার ব্যবহার করুন | বন্ধ করতে </span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px]">Esc</kbd>
                <span> চাপুন অথবা বাইরে ক্লিক করুন</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export function CandidateExamView({
  candidateName,
  passportNo,
  targetCountry,
  candidateTrade,
  companyId,
}: {
  candidateName?: string
  passportNo?: string
  targetCountry?: string
  candidateTrade?: string
  companyId?: string
}) {
  // --------------------------------------------------------------------------
  // Categories State
  // --------------------------------------------------------------------------
  const defaultCats: CategoryItem[] = useMemo(() => {
    return realExamData.categories.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      color: c.color,
      questionCount: realExamData.questions.filter((q) => q.setId === c.id).length || 15,
    }))
  }, [])

  const [categories, setCategories] = useState<CategoryItem[]>(defaultCats)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(defaultCats[0]?.id || "set-01")
  const [dbCategoryMap, setDbCategoryMap] = useState<Record<string, string>>({})

  // Fetch company categories from backend if available
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("/api/question-categories", {
          headers: companyId ? { "x-company-id": companyId } : {},
        })
        const items = res.data?.data || []
        if (Array.isArray(items) && items.length > 0) {
          const map: Record<string, string> = {}
          const merged: CategoryItem[] = items.map((cat: any) => {
            map[cat.name] = cat.id
            return {
              id: cat.id,
              name: cat.name,
              code: cat.code,
              color: cat.color || "#1B64F2",
              questionCount: cat.questionCount || 15,
            }
          })
          setDbCategoryMap(map)
          setCategories(merged)
          // Default selection based on trade or first
          const matched = merged.find(
            (c) => candidateTrade && c.name.toLowerCase().includes(candidateTrade.toLowerCase())
          )
          if (matched) {
            setSelectedCategoryId(matched.id)
          } else {
            setSelectedCategoryId(merged[0].id)
          }
        }
      } catch {
        // Fallback to local realExamData
      }
    }

    loadCategories()
  }, [companyId, candidateTrade])

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0]
  }, [categories, selectedCategoryId])

  // --------------------------------------------------------------------------
  // Exam Engine State
  // --------------------------------------------------------------------------
  type ExamScreen = "SELECT" | "TUTORIAL" | "EXAM"
  const [screen, setScreen] = useState<ExamScreen>("SELECT")
  const [tutorialStep, setTutorialStep] = useState<number>(0)
  const [tutorialTime, setTutorialTime] = useState<number>(289) // 00:04:49 countdown
  const [examQuestions, setExamQuestions] = useState<QuestionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState<number>(1800) // 30 minutes in seconds
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showFinalSubmitConfirm, setShowFinalSubmitConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const [savingResult, setSavingResult] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Tutorial countdown timer
  useEffect(() => {
    if (screen !== "TUTORIAL") return
    const timer = setInterval(() => {
      setTutorialTime((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [screen])

  // Pre-fetch questions in background when category is selected so start is instantaneous (0ms)
  useEffect(() => {
    if (screen !== "TUTORIAL" && screen !== "SELECT") return
    const prefetch = async () => {
      const dbCatId = dbCategoryMap[selectedCategory.name] || selectedCategory.id
      try {
        await axios.get(`/api/questions?categoryId=${dbCatId}&pageSize=50`, {
          headers: companyId ? { "x-company-id": companyId } : {},
        })
      } catch {}
    }
    prefetch()
  }, [selectedCategory.name, selectedCategory.id, companyId, screen])

  // Browser Fullscreen API Toggle
  const toggleBrowserFullscreen = () => {
    if (typeof document === "undefined") return
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsBrowserFullscreen(true)
      }).catch(() => {})
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsBrowserFullscreen(false)
        }).catch(() => {})
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Start timer when entering EXAM
  useEffect(() => {
    if (screen !== "EXAM") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [screen])

  // Format seconds to MM:SS
  const formattedTutorialTime = useMemo(() => {
    const mins = Math.floor(tutorialTime / 60)
    const secs = tutorialTime % 60
    return `00:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [tutorialTime])

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [timeLeft])

  // Handle Start Exam
  const handleStartExam = async () => {
    setLoadingQuestions(true)
    try {
      // 1. Try to load from backend questions API
      let loaded: QuestionItem[] = []
      const dbCatId = dbCategoryMap[selectedCategory.name] || selectedCategory.id

      try {
        let res = await axios.get(`/api/questions?categoryId=${dbCatId}&pageSize=50`, {
          headers: companyId ? { "x-company-id": companyId } : {},
        })
        let rawData = res.data?.data
        let items: any[] = Array.isArray(rawData) ? rawData : rawData?.items || []

        // If no questions found by category ID, query without category filter and match by category
        if (items.length === 0) {
          res = await axios.get(`/api/questions?pageSize=50`, {
            headers: companyId ? { "x-company-id": companyId } : {},
          })
          rawData = res.data?.data
          items = Array.isArray(rawData) ? rawData : rawData?.items || []
          const filtered = items.filter(
            (q: any) =>
              q.categoryId === dbCatId ||
              q.categoryName?.toLowerCase().includes(selectedCategory.name.toLowerCase())
          )
          if (filtered.length > 0) {
            items = filtered
          }
        }

        if (items.length > 0) {
          loaded = items.map((q: any) => ({
            id: q.id || q._id,
            questionText: q.questionText,
            imageUrl: q.imageUrl || q.image || q.imageKey || undefined,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
            difficulty: q.difficulty,
            explanation: q.explanation,
          }))
        }
      } catch (err) {
        console.error("Failed to load questions from backend:", err)
      }

      // 2. If backend had no questions, fallback to real-exam-questions.json
      if (loaded.length === 0) {
        const matched = realExamData.questions.filter(
          (q) => q.categoryName === selectedCategory.name || q.setId === selectedCategory.id
        )
        if (matched.length > 0) {
          loaded = matched.map((q: any, idx: number) => ({
            id: `q_${idx}`,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
            difficulty: q.difficulty,
          }))
        } else {
          // General fallback to set-01
          loaded = realExamData.questions.slice(0, 15).map((q: any, idx: number) => ({
            id: `q_${idx}`,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
            difficulty: q.difficulty,
          }))
        }
      }

      // Smart Question Randomization / Jumble (Fisher-Yates algorithm)
      // Ensures candidates receive unique, jumbled question sequences
      const shuffledLoaded = [...loaded]
      for (let i = shuffledLoaded.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledLoaded[i], shuffledLoaded[j]] = [shuffledLoaded[j], shuffledLoaded[i]]
      }

      setExamQuestions(shuffledLoaded)
      setCurrentIndex(0)
      setAnswers({})
      setTimeLeft(1800) // 30 mins
      setScreen("EXAM")
      setShowStartConfirm(false)
    } finally {
      setLoadingQuestions(false)
    }
  }

  // Answer selection (Toggles: 1st click selects, 2nd click deselects)
  const handleSelectOption = (key: string) => {
    setAnswers((prev) => {
      if (prev[currentIndex] === key) {
        const copy = { ...prev }
        delete copy[currentIndex]
        return copy
      }
      return {
        ...prev,
        [currentIndex]: key,
      }
    })
  }

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const copy = { ...prev }
      delete copy[currentIndex]
      return copy
    })
  }

  // Keyboard Shortcut Navigation for Instant, Ergonomic Test-Taking
  useEffect(() => {
    if (screen !== "EXAM" || showSubmitConfirm || showExitConfirm) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      const key = e.key.toUpperCase()
      const currentOptions = examQuestions[currentIndex]?.options || []

      // 1. Direct letter keys: A, B, C, D
      const letterMatch = currentOptions.find((o) => o.key.toUpperCase() === key)
      if (letterMatch) {
        e.preventDefault()
        handleSelectOption(letterMatch.key)
        return
      }

      // 2. Numeric keys: 1, 2, 3, 4
      if (["1", "2", "3", "4", "5", "6", "7", "8"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        if (currentOptions[idx]) {
          e.preventDefault()
          handleSelectOption(currentOptions[idx].key)
          return
        }
      }

      // 3. Arrow & Action keys
      if (e.key === "ArrowRight") {
        e.preventDefault()
        setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleClearAnswer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [screen, currentIndex, examQuestions, showSubmitConfirm, showExitConfirm])

  // Result metrics
  const resultStats = useMemo(() => {
    let score = 0
    let correctCount = 0
    let wrongCount = 0
    let unansweredCount = 0

    examQuestions.forEach((q, idx) => {
      const selected = answers[idx]
      if (!selected) {
        unansweredCount++
      } else if (selected.toUpperCase() === q.correctAnswer.toUpperCase()) {
        score += q.marks || 1
        correctCount++
      } else {
        wrongCount++
      }
    })

    const totalQuestions = examQuestions.length || 15
    const percentage = Math.round((correctCount / totalQuestions) * 100)
    const isPassed = percentage >= 50

    return {
      score,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      isPassed,
    }
  }, [examQuestions, answers])

  // Submit and calculate score + save to MongoDB
  const handleFinishExam = async () => {
    setShowSubmitConfirm(false)
    setScreen("SELECT")

    // Exit browser fullscreen on exam complete
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }

    message.success("আপনার পরীক্ষা সফলভাবে সম্পন্ন হয়েছে / Exam submitted successfully")

    // Save result to MongoDB matching the exact columns from the image
    setSavingResult(true)
    try {
      const cleanName = candidateName || "Mamun"
      const cleanPassport = (passportNo || "987654321").trim()
      const formattedResult = `${resultStats.correctCount} / ${resultStats.totalQuestions}`

      await axios.post(
        "/api/exam-results",
        {
          name: cleanName,
          passportNumber: cleanPassport,
          password: cleanPassport,
          result: formattedResult,
        },
        {
          headers: companyId ? { "x-company-id": companyId } : {},
        }
      )
    } catch (err) {
      console.error("Failed to save exam result:", err)
    } finally {
      setSavingResult(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const currentQ = examQuestions[currentIndex]

  // ==========================================================================
  // VIEW 1: CATEGORY SELECTION (Click category to open Tutorial View)
  // ==========================================================================
  if (screen === "SELECT") {
    return (
      <div className="space-y-10 py-6 sm:py-10 max-w-6xl mx-auto px-3 sm:px-6 font-sans">
        {/* Main Headline */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#005CC1] border border-blue-100 text-xs font-bold tracking-wide"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#005CC1]" />
            <span>দক্ষতা ও যোগ্যতা মূল্যায়ন পরীক্ষা / Competency Examination</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#005CC1] tracking-tight leading-tight"
          >
            SVPI Exam System
          </motion.h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            পরীক্ষা শুরু করতে নিচে আপনার ট্রেড / ক্যাটাগরি নির্বাচন করুন
          </p>
        </div>

        {/* 10 Category Selection Grid (2 rows x 5 cols on lg) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {categories.map((cat, idx) => {
            const isSelected = selectedCategoryId === cat.id

            return (
              <motion.button
                key={cat.id || idx}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedCategoryId(cat.id)
                  setTutorialStep(0)
                  setScreen("TUTORIAL")
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 text-center transition-all cursor-pointer min-h-[95px] sm:min-h-[110px] select-none",
                  isSelected
                    ? "border-[#005CC1] bg-blue-50/70 shadow-md shadow-blue-500/10 ring-2 ring-[#005CC1]/30 font-bold text-[#005CC1]"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700 shadow-2xs font-semibold"
                )}
              >
                {/* Active Indicator Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#005CC1] text-white flex items-center justify-center shadow-xs">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}

                {/* Trade Title */}
                <span className="text-xs sm:text-sm leading-snug font-bold">
                  {cat.name}
                </span>

                {/* Small Question Count Pill */}
                <span
                  className={cn(
                    "mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isSelected
                      ? "bg-white text-[#005CC1] shadow-2xs"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {cat.questionCount || 15}টি প্রশ্ন
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Key Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#005CC1] flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">সময় বরাদ্দ</span>
              <span className="text-xs font-bold text-slate-800">৩০ মিনিট</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">মোট প্রশ্ন</span>
              <span className="text-xs font-bold text-slate-800">{selectedCategory.questionCount || 15}টি বহুনির্বাচনী</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">পাস নম্বর</span>
              <span className="text-xs font-bold text-emerald-600">৫০% (Pass)</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">পরীক্ষা মোড</span>
              <span className="text-xs font-bold text-slate-800">নিরাপদ অনলাইন</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // VIEW 2: TUTORIAL / INSTRUCTION VIEW (Matches user's reference image!)
  // ==========================================================================
  if (screen === "TUTORIAL") {
    const tutorialSteps = [
      {
        title: "পরীক্ষার মধ্য দিয়ে নেভিগেট করা",
        content: (
          <div className="space-y-6 sm:space-y-8 text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
            <div className="flex flex-wrap items-center gap-2">
              <span>পরবর্তী প্রশ্নে যাওয়ার জন্য</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                এগিয়ে যান <ChevronRight className="h-4 w-4" />
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span>আগের প্রশ্নে ফিরে যাওয়ার জন্য</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                <ChevronLeft className="h-4 w-4" /> ফেরত যান
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[#005CC1]">
              <span>টিউটোরিয়াল অব্যাহত রাখতে</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                এগিয়ে যান <ChevronRight className="h-4 w-4" />
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>
          </div>
        ),
      },
      {
        title: "সঠিক উত্তর নির্বাচন ও পরিবর্তন",
        content: (
          <div className="space-y-6 sm:space-y-8 text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
            <div className="flex flex-wrap items-center gap-2">
              <span>সঠিক উত্তরের পাশে থাকা বৃত্তে</span>
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border-2 border-[#1b75a6] text-[#1b75a6] font-extrabold text-sm">
                A
              </span>
              <span>ক্লিক করে উত্তর নির্বাচন করুন।</span>
            </div>

            <div>উত্তর পরিবর্তন করতে চাইলে অন্য যেকোনো বিকল্পে ক্লিক করুন।</div>

            <div className="flex flex-wrap items-center gap-2">
              <span>উত্তর মুছে ফেলতে চাইলে</span>
              <span className="inline-flex items-center px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-xs text-sm sm:text-base">
                উত্তর মুছুন
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>
          </div>
        ),
      },
      {
        title: "প্রশ্ন সম্পর্কিত ছবি ও জুম",
        content: (
          <div className="space-y-6 sm:space-y-8 text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
            <div>প্রশ্নে চিত্র বা ছবি সংযুক্ত থাকলে তা স্ক্রিনের মাঝে দেখতে পাবেন।</div>

            <div className="flex flex-wrap items-center gap-2">
              <span>ছবি বড় ও বিস্তারিত দেখতে</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                🔍 বড় করে দেখতে ছবিতে ক্লিক করুন
              </span>
              <span>বাটনে চাপুন।</span>
            </div>

            <div>জুম ইন (+), জুম আউট (-) এবং ছবি ঘোরানোর সুবিধা ব্যবহার করতে পারবেন।</div>
          </div>
        ),
      },
      {
        title: "পরীক্ষা সমাপ্তি ও জমা দেওয়া",
        content: (
          <div className="space-y-6 sm:space-y-8 text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
            <div className="flex flex-wrap items-center gap-2">
              <span>সব প্রশ্নের উত্তর দেওয়া শেষ হলে</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                পরীক্ষা সম্পন্ন করুন
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>

            <div>নিশ্চিতকরণ উইন্ডোতে নিশ্চিত করলেই আপনার পরীক্ষা জমা হবে।</div>

            <div className="flex flex-wrap items-center gap-2 text-emerald-700">
              <span>এখন পরীক্ষা শুরু করতে নিচে থাকা</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b75a6] text-white font-bold rounded-xs text-sm sm:text-base shadow-xs">
                পরীক্ষাটি শুরু করুন &gt;
              </span>
              <span>বাটনে ক্লিক করুন।</span>
            </div>
          </div>
        ),
      },
    ]

    const currentStepData = tutorialSteps[tutorialStep]

    return (
      <div className="fixed inset-0 z-[9999] bg-[#eef2f6] w-screen h-screen overflow-hidden flex flex-col font-sans select-none">
        {/* Top Header Bar */}
        <header className="h-12 bg-[#1a3348] text-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-700 shrink-0 text-xs sm:text-sm font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <span>পরীক্ষা: {selectedCategory.name} - Bengali</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs sm:text-sm">
            <span className="text-slate-200">⏱ {formattedTutorialTime}</span>
            <span className="text-emerald-400 font-sans font-bold">অগ্রগতি {Math.round((tutorialStep / 3) * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">পরীক্ষার্থী:</span>
            <span className="text-white font-extrabold">{candidateName || "A MALEK MD"}</span>
          </div>
        </header>

        {/* Body: Left palette tabs (1 to 4) + Center tutorial card */}
        <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-6 items-start overflow-y-auto">
          {/* Left Vertical Palette (Chevron arrow tabs 1..4) */}
          <div className="w-full md:w-16 lg:w-20 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {[0, 1, 2, 3].map((stepIdx) => {
              const isCurrent = stepIdx === tutorialStep

              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => setTutorialStep(stepIdx)}
                  style={{ clipPath: "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)" }}
                  className={cn(
                    "h-9 sm:h-10 w-14 sm:w-16 md:w-full shrink-0 flex items-center justify-center font-sans text-xs sm:text-sm transition-all cursor-pointer select-none relative p-[1px]",
                    isCurrent
                      ? "bg-[#718096] z-10 scale-[1.02]"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                >
                  <div
                    style={{ clipPath: "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)" }}
                    className={cn(
                      "w-full h-full flex items-center justify-center pr-2 font-bold transition-colors",
                      isCurrent
                        ? "bg-[#8e9aa8] text-slate-900 font-black"
                        : "bg-white text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <span className="-ml-1">{stepIdx + 1}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Center Content Canvas (Matching image) */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-12 min-h-[380px] flex flex-col justify-between">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">
                {currentStepData.title}
              </h2>

              {currentStepData.content}
            </div>
          </div>
        </div>

        {/* Bottom Footer Navigation Bar (Matching image) */}
        <footer className="h-14 bg-[#49657b] px-4 sm:px-8 flex items-center justify-end gap-3 border-t border-slate-600 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (tutorialStep > 0) {
                setTutorialStep(tutorialStep - 1)
              } else {
                setScreen("SELECT")
              }
            }}
            className="bg-[#1b75a6] hover:bg-[#165e85] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>ফেরত যান</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (tutorialStep < 3) {
                setTutorialStep(tutorialStep + 1)
              } else {
                setShowStartConfirm(true)
              }
            }}
            className="bg-[#1b75a6] hover:bg-[#165e85] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <span>এগিয়ে যান</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowStartConfirm(true)}
            className="bg-[#1b75a6] hover:bg-[#165e85] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2 rounded-xs flex items-center gap-1 transition cursor-pointer ring-1 ring-white/40 shadow-sm"
          >
            <span>পরীক্ষাটি শুরু করুন</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </footer>

        {/* Pre-Exam Identity Confirmation Screen */}
        {showStartConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[99999] bg-white flex items-center justify-center p-6 sm:p-12 overflow-y-auto select-none">
            <div className="max-w-3xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-start text-center">
              {/* Left Column: Confirm Identity */}
              <div className="flex flex-col items-center space-y-6 max-w-xs mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  আপনি {candidateName || "Mamun"}?
                  <br />
                  হলে নিশ্চিত করুন
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    handleStartExam()
                  }}
                  disabled={loadingQuestions}
                  className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-base sm:text-lg pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-sm transition-all cursor-pointer disabled:opacity-50 group"
                >
                  <span>{loadingQuestions ? "প্রস্তুত হচ্ছে..." : "নিশ্চিত করুন"}</span>
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                    {loadingQuestions ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Check className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[2.5]" />
                    )}
                  </span>
                </button>
              </div>

              {/* Right Column: Cancel / Not Identity */}
              <div className="flex flex-col items-center space-y-6 max-w-xs mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  আপনি {candidateName || "Mamun"}?
                  <br />
                  না হলে বাতিল করুন
                </h3>

                <button
                  type="button"
                  onClick={() => setShowStartConfirm(false)}
                  className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-base sm:text-lg pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-sm transition-all cursor-pointer group"
                >
                  <span>বাতিল করুন</span>
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                    <X className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[2.5]" />
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  // ==========================================================================
  // VIEW 2: LIVE EXAMINATION SCREEN (Matches user's reference image!)
  // ==========================================================================
  if (screen === "EXAM" && currentQ) {
    const isAnswered = answers[currentIndex] !== undefined

    const examContent = (
      <div className="fixed inset-0 z-[9999] bg-[#f8fafc] w-screen h-screen overflow-y-auto flex flex-col font-sans select-none">
        {/* Top Animated Glowing Progress Meter */}
        <div className="h-1.5 w-full bg-slate-200 sticky top-0 left-0 z-40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#005CC1] via-sky-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
          />
        </div>

        {/* Sticky Top Status Bar */}
        <header className="sticky top-1.5 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-[#005CC1] font-bold text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 text-[#005CC1]" />
              <span className="truncate max-w-[160px] sm:max-w-none">{selectedCategory.name}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm">
              <span>প্রশ্ন:</span>
              <strong className="text-[#005CC1] font-black">{currentIndex + 1}</strong>
              <span className="text-slate-400">/</span>
              <span>{examQuestions.length}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>উত্তর সম্পন্ন: <strong className="text-emerald-700 font-black">{answeredCount}</strong>/{examQuestions.length}</span>
            </div>

            {isAnswered && (
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-xs font-bold animate-fade-in">
                <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-700" />
                <span>বর্তমান প্রশ্ন উত্তর দেওয়া হয়েছে</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Countdown Clock */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black border transition-all shadow-2xs",
                timeLeft < 300
                  ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse ring-2 ring-rose-500/20"
                  : "bg-slate-900 text-white border-slate-800"
              )}
            >
              <Clock className={cn("h-4 w-4", timeLeft < 300 ? "text-rose-500" : "text-sky-400")} />
              <span className="tracking-wider">{formattedTime}</span>
            </div>

            {/* Native Browser Fullscreen Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBrowserFullscreen}
              title={isBrowserFullscreen ? "স্বাভাবিক স্ক্রিন" : "সম্পূর্ণ স্ক্রিন"}
              className="h-9 px-2.5 sm:px-3 text-xs font-bold rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              {isBrowserFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">স্বাভাবিক মোড</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">ফুলস্ক্রিন</span>
                </>
              )}
            </Button>

            {/* Final Submit Button (Clean Light Red Background) */}
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="h-9 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#fee2e2] hover:bg-[#fecaca] active:bg-[#fca5a5] text-[#b91c1c] border border-[#fca5a5] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-102 select-none"
            >
              <span>পরীক্ষা সম্পন্ন করুন</span>
            </button>
          </div>
        </header>

        {/* Full-width Exam Body: Left Palette (01 to 15) + Right Canvas */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Question Palette (Single-column vertical chevron tabs matching reference shape) */}
          <div className="w-full md:w-20 lg:w-22 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 select-none md:sticky md:top-20">
            {examQuestions.map((_, idx) => {
              const isCurrent = idx === currentIndex
              const answered = answers[idx] !== undefined
              const paddedNum = (idx + 1).toString().padStart(2, "0")

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  style={{ clipPath: "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)" }}
                  className={cn(
                    "h-8 sm:h-9 w-14 sm:w-16 md:w-full shrink-0 flex items-center justify-center font-sans text-xs sm:text-sm transition-all cursor-pointer select-none relative p-[1px]",
                    isCurrent
                      ? "bg-[#718096] z-10 scale-[1.02]"
                      : answered
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  title={`প্রশ্ন ${idx + 1}: ${answered ? "উত্তর সম্পন্ন" : "বাকি আছে"}`}
                >
                  <div
                    style={{ clipPath: "polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)" }}
                    className={cn(
                      "w-full h-full flex items-center justify-center pr-2 font-bold transition-colors relative",
                      isCurrent
                        ? "bg-[#8e9aa8] text-slate-900 font-black"
                        : answered
                        ? "bg-emerald-50 text-emerald-900 font-black hover:bg-emerald-100/90"
                        : "bg-white text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <span className="-ml-1">{paddedNum}</span>
                    {answered && !isCurrent && (
                      <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                    {answered && isCurrent && (
                      <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-800" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* RIGHT: Question Content Area (Modern Elevated Canvas) */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-7">
            
            {/* Top Meta Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#005CC1] font-extrabold text-xs">
                  {selectedCategory.name}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                  ভাষা: বাংলা (Bangla)
                </span>
              </div>

              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                মান: ১ নম্বর
              </span>
            </div>

            {/* Question Text */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed tracking-tight">
                <span className="text-[#005CC1] font-black mr-2">
                  {currentIndex + 1}.
                </span>
                {currentQ.questionText}
              </h2>
            </div>

            {/* Optional Question Image (Centered & Skeleton/Loader Enabled Presentation) */}
            {currentQ.imageUrl && (
              <QuestionImage
                src={currentQ.imageUrl}
                alt={currentQ.questionText}
              />
            )}

            {/* Options List with Interactive Modern Cards */}
            <div className="space-y-3.5 pt-1">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentIndex] === opt.key

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={cn(
                      "flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer select-none group",
                      isSelected
                        ? "border-[#005CC1] bg-gradient-to-r from-blue-50/90 to-sky-50/30 shadow-sm shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:border-[#005CC1]/50 hover:bg-blue-50/20"
                    )}
                  >
                    {/* Bold Option Key Circle (A, B, C, D) */}
                    <div
                      className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base transition-all shrink-0",
                        isSelected
                          ? "bg-[#005CC1] text-white shadow-md shadow-blue-500/25 scale-105"
                          : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#005CC1]"
                      )}
                    >
                      {opt.key}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={cn(
                        "text-base sm:text-lg leading-relaxed block",
                        isSelected ? "text-slate-950 font-black" : "text-slate-800 font-medium group-hover:text-slate-900"
                      )}>
                        {opt.text}
                      </span>
                    </div>

                    {/* Right Selection Indicator */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-[#005CC1] text-white flex items-center justify-center shadow-xs">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-slate-300 group-hover:border-[#005CC1]/60" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Card Action Controls & Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs sm:text-sm font-bold rounded-xl px-4 sm:px-5 py-2.5 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  ফেরত যান
                </Button>

                {isAnswered && (
                  <button
                    type="button"
                    onClick={handleClearAnswer}
                    className="text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    উত্তর মুছুন
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentIndex < examQuestions.length - 1 && (
                  <Button
                    onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                    className="bg-[#005CC1] hover:bg-[#004ca3] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all hover:scale-102"
                  >
                    এগিয়ে যান
                    <ChevronRight className="h-4 w-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Keyboard Shortcut Hint Banner */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-500 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#005CC1] shrink-0" />
                <span>কিবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">D</kbd> চেপে উত্তর দিন | <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">→</kbd> এগিয়ে যান / <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">←</kbd> ফেরত যান</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Confirmation Modal with Modern UI/UX */}
        {showExitConfirm && mounted && createPortal(
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

              {/* Header Badge */}
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <LogOut className="h-4 w-4 text-slate-600" />
                  <span>পরীক্ষা প্রস্থান নিশ্চিতকরণ</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  আপনি কি পরীক্ষা থেকে প্রস্থান করতে চান?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  প্রস্থান করলে বর্তমান পরীক্ষার অগ্রগতি ও উত্তর সংরক্ষিত নাও থাকতে পারে
                </p>
              </div>

              {/* Grid with 2 Options: Cancel on Left (First), Confirm Exit on Right (Second) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
                {/* Left Column (First): Stay in Exam */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      পরীক্ষায় থাকুন
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      পরীক্ষা চালিয়ে যেতে চাইলে,
                      <br />
                      বাতিল করে ফিরে যান
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>বাতিল করুন</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <X className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>

                {/* Right Column (Second): Confirm Exit */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      প্রস্থান নিশ্চিত
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      পরীক্ষা শেষ না করে বের হতে,
                      <br />
                      প্রস্থান নিশ্চিত করুন
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false)
                      setScreen("SELECT")
                      if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
                        document.exitFullscreen().catch(() => {})
                      }
                    }}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>প্রস্থান করুন</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

        {/* 1st Step Submit Confirmation Screen */}
        {showSubmitConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-8 sm:p-12 md:p-14 relative overflow-hidden"
            >
              {/* Subtle decorative background glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-slate-100 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-slate-100 rounded-full blur-3xl pointer-events-none" />

              {/* Security / Submission Header Badge */}
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <Award className="h-4 w-4 text-slate-600" />
                  <span>পরীক্ষা সমাপ্তি নিশ্চিতকরণ (১ম ধাপ)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  আপনি কি পরীক্ষা জমা দিতে চান?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  জমা দেওয়ার পূর্বে নিশ্চিত করুন, পরবর্তী ধাপে চূড়ান্ত সাবমিশন চাওয়া হবে
                </p>
              </div>

              {/* Grid with 2 Options: Cancel on Left (First), Confirm on Right (Second) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
                {/* Left Column (First): Cancel Submission / Return to Exam */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      পরীক্ষায় ফিরে যান
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      উত্তর পর্যালোচনা করতে চাইলে,
                      <br />
                      বাতিল করে ফিরে যান
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirm(false)
                      setShowCancelConfirm(true)
                    }}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>বাতিল করুন</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <X className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>

                {/* Right Column (Second): Proceed to 2nd Confirmation */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      পরবর্তী ধাপ
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      সব উত্তর জমা দিতে প্রস্তুত হলে,
                      <br />
                      এগিয়ে যান
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirm(false)
                      setShowFinalSubmitConfirm(true)
                    }}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>এগিয়ে যান</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

        {/* 2nd Step Final Submit Confirmation Screen */}
        {showFinalSubmitConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-8 sm:p-12 md:p-14 relative overflow-hidden"
            >
              {/* Subtle decorative background glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-50 rounded-full blur-3xl pointer-events-none" />

              {/* Security / Submission Header Badge */}
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck className="h-4 w-4 text-rose-600" />
                  <span>চূড়ান্ত সাবমিশন নিশ্চিতকরণ (২য় ধাপ)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  আপনি কি চূড়ান্তভাবে পরীক্ষা সাবমিট করতে নিশ্চিত?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  একবার চূড়ান্ত সাবমিট করলে আর কোনো প্রশ্নের উত্তর পরিবর্তন করা যাবে না এবং পরীক্ষা সমাপ্ত হয়ে যাবে
                </p>
              </div>

              {/* Grid with 2 Options: Cancel on Left (First), Confirm on Right (Second) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
                {/* Left Column (First): Cancel Submission / Return to Exam */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      পুনর্বিবেচনা
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      যদি আরও ভেবে দেখতে চান,
                      <br />
                      তবে বাতিল করে ফিরে যান
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFinalSubmitConfirm(false)}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>বাতিল করুন</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <X className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>

                {/* Right Column (Second): Final Confirm Submission */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      চূড়ান্ত সমাপ্তি
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      ফলাফল প্রক্রিয়াজাত করতে,
                      <br />
                      চূড়ান্ত সাবমিট নিশ্চিত করুন
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowFinalSubmitConfirm(false)
                      handleFinishExam()
                    }}
                    disabled={savingResult}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer disabled:opacity-50 group"
                  >
                    <span>{savingResult ? "সংরক্ষণ হচ্ছে..." : "চূড়ান্ত সাবমিট করুন"}</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

        {/* 2nd Step Cancel Confirmation Screen */}
        {showCancelConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full p-8 sm:p-12 md:p-14 relative overflow-hidden"
            >
              {/* Subtle decorative background glow */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-50 rounded-full blur-3xl pointer-events-none" />

              {/* Header Badge */}
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>বাতিল নিশ্চিতকরণ (২য় ধাপ)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  আপনি কি নিশ্চিতভাবে বাতিল করে পরীক্ষায় ফিরে যেতে চান?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  বাতিল করলে বর্তমান সাবমিশন প্রক্রিয়া বন্ধ হবে এবং আপনি পরীক্ষায় ফিরে যাবেন
                </p>
              </div>

              {/* Grid with 2 Options: Left = Return to Submission, Right = Confirm Cancel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
                {/* Left Column (First): Return to Submit Dialog */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      সাবমিশনে ফিরুন
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      যদি পরীক্ষা জমা দিতে চান,
                      <br />
                      তবে পেছনে ফিরুন
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelConfirm(false)
                      setShowSubmitConfirm(true)
                    }}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>ফিরে যান</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <X className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>

                {/* Right Column (Second): Confirm Cancel and Resume Exam */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-slate-50/70 border-2 border-slate-200/80 hover:border-slate-300 transition-all text-center group">
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      পরীক্ষা বজায় রাখুন
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      সাবমিট বাতিল করতে চাইলে,
                      <br />
                      বাতিল নিশ্চিত করুন
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-base pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 rounded-2xl border-2 border-slate-300 hover:border-slate-500 shadow-xs transition-all cursor-pointer group"
                  >
                    <span>বাতিল নিশ্চিত করুন</span>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-400 group-hover:border-slate-700 flex items-center justify-center text-slate-700 group-hover:text-slate-950 bg-transparent transition-colors shrink-0">
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </div>
    )

    if (mounted && typeof document !== "undefined") {
      return createPortal(examContent, document.body)
    }
    return examContent
  }

  return null
}
