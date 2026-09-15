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
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Modal, Image as AntImage, message } from "antd"
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
  type ExamScreen = "SELECT" | "EXAM"
  const [screen, setScreen] = useState<ExamScreen>("SELECT")
  const [examQuestions, setExamQuestions] = useState<QuestionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState<number>(1800) // 30 minutes in seconds
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const [savingResult, setSavingResult] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        const res = await axios.get(`/api/questions?categoryId=${dbCatId}&pageSize=50`, {
          headers: companyId ? { "x-company-id": companyId } : {},
        })
        const items = res.data?.data?.items || []
        if (items.length > 0) {
          loaded = items.map((q: any) => ({
            id: q.id,
            questionText: q.questionText,
            imageUrl: q.imageUrl,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
            difficulty: q.difficulty,
            explanation: q.explanation,
          }))
        }
      } catch {
        // Handled below
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
  // VIEW 1: CATEGORY SELECTION (Matches the user's reference image!)
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
            নিরাপদ ও আধুনিক পরীক্ষা ব্যবস্থা
          </motion.h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            আপনার বৈদেশিক চাকরির যোগ্যতা প্রমাণের জন্য নির্ধারিত ক্যাটাগরি সেট নির্বাচন করুন এবং পরীক্ষা শুরু করুন।
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
                onClick={() => setSelectedCategoryId(cat.id)}
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
                <span className="text-xs sm:text-sm leading-snug">
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

        {/* Action Section with Subtitle & Primary CTA */}
        <div className="text-center space-y-6 pt-2">
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Welcome to the Competency Examination Platform. Please select a Question Bank set above and click{" "}
            <span className="font-bold text-[#005CC1]">"পরীক্ষা শুরু করুন"</span> to start.
          </p>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              disabled={loadingQuestions}
              onClick={() => setShowStartConfirm(true)}
              className="bg-[#005CC1] hover:bg-[#004ca3] active:bg-[#003d82] text-white font-extrabold text-lg sm:text-xl px-10 sm:px-14 py-6 sm:py-7 rounded-full shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              {loadingQuestions ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  প্রশ্ন প্রস্তুত হচ্ছে...
                </>
              ) : (
                <>
                  <PlayCircle className="h-6 w-6" />
                  পরীক্ষা শুরু করুন ({selectedCategory.name})
                </>
              )}
            </Button>
          </div>

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

        {/* Pre-Exam Identity Confirmation Screen matching User's 1st Image */}
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
                    setShowStartConfirm(false)
                    handleStartExam()
                  }}
                  disabled={loadingQuestions}
                  className="bg-[#00965e] hover:bg-[#007d4e] active:scale-95 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  নিশ্চিত করুন
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
                  className="bg-[#ff2e2e] hover:bg-[#e02424] active:scale-95 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                >
                  বাতিল করুন
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

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>উত্তর সম্পন্ন: {answeredCount} টি ({Math.round((answeredCount / examQuestions.length) * 100)}%)</span>
            </div>
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

            {/* Exit Exam */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitConfirm(true)}
              className="h-9 px-2.5 sm:px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">প্রস্থান</span>
            </Button> */}

            {/* Final Submit Button */}
            <Button
              size="sm"
              onClick={() => setShowSubmitConfirm(true)}
              className="h-9 bg-[#005CC1] hover:bg-[#004ca3] text-white font-bold text-xs sm:text-sm px-4 rounded-xl shadow-xs cursor-pointer transition-all hover:scale-102"
            >
              পরীক্ষা সম্পন্ন করুন
            </Button>
          </div>
        </header>

        {/* Full-width Exam Body: Left Palette (01 to 15) + Right Canvas */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Futuristic Question Palette (Ultra-Modern Badge Grid & Progress Tracker) */}
          <div className="w-full md:w-64 shrink-0 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4 md:sticky md:top-20 select-none">
            
            {/* Palette Header with Live Progress */}
            <div className="space-y-2.5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005CC1] flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    প্রশ্ন প্যালেট
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005CC1] border border-blue-200/60 font-mono">
                  {answeredCount}/{examQuestions.length}
                </span>
              </div>

              {/* Mini Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#005CC1] to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span className="text-emerald-600 font-extrabold">{answeredCount} টি সম্পন্ন</span>
                  <span className="text-slate-400">{examQuestions.length - answeredCount} টি বাকি</span>
                </div>
              </div>
            </div>

            {/* Circular & Modern Badge Tiles (4 in a row on Desktop/Tablet) */}
            <div className="grid grid-cols-5 md:grid-cols-4 gap-2.5 py-1">
              {examQuestions.map((_, idx) => {
                const isCurrent = idx === currentIndex
                const answered = answers[idx] !== undefined
                const paddedNum = (idx + 1).toString().padStart(2, "0")

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "relative h-11 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-xs transition-all cursor-pointer select-none group",
                      isCurrent
                        ? "bg-gradient-to-tr from-[#005CC1] to-sky-500 text-white shadow-lg shadow-blue-500/30 ring-3 ring-blue-500/25 ring-offset-2 scale-105 z-10"
                        : answered
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105"
                        : "bg-slate-50/90 text-slate-700 border border-slate-200 hover:border-[#005CC1] hover:bg-white hover:text-[#005CC1] hover:shadow-xs"
                    )}
                    title={`প্রশ্ন ${idx + 1}: ${answered ? "উত্তর দেওয়া হয়েছে" : "বাকি আছে"}`}
                  >
                    <span className="leading-none">{paddedNum}</span>

                    {/* Small Status indicator icon */}
                    {answered && !isCurrent && (
                      <Check className="h-3 w-3 stroke-[3] text-emerald-100 absolute -top-1 -right-1 bg-emerald-600 rounded-full p-0.5 shadow-xs" />
                    )}
                    {isCurrent && (
                      <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Unanswered Jumper Button (Smart UX Feature) */}
            {answeredCount < examQuestions.length && (
              <button
                type="button"
                onClick={() => {
                  for (let i = 1; i <= examQuestions.length; i++) {
                    const target = (currentIndex + i) % examQuestions.length
                    if (answers[target] === undefined) {
                      setCurrentIndex(target)
                      return
                    }
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 text-[#005CC1] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                title="পরবর্তী না দেওয়া প্রশ্নে যান"
              >
                <span>পরবর্তী বাকি প্রশ্ন</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Status Legend */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#005CC1]" />
                <span>বর্তমান</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>সম্পন্ন</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span>বাকি</span>
              </div>
            </div>
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

            {/* Optional Question Image */}
            {currentQ.imageUrl && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 max-w-lg shadow-2xs">
                <AntImage
                  src={currentQ.imageUrl}
                  alt={currentQ.questionText}
                  style={{ maxHeight: 260, maxWidth: "100%", objectFit: "contain" }}
                  className="rounded-xl mx-auto"
                />
              </div>
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
                  পূর্ববর্তী প্রশ্ন
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
                {currentIndex < examQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                    className="bg-[#005CC1] hover:bg-[#004ca3] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all hover:scale-102"
                  >
                    পরবর্তী প্রশ্ন
                    <ChevronRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-7 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
                  >
                    পরীক্ষা সম্পন্ন করুন
                    <CheckCircle2 className="h-4 w-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Keyboard Shortcut Hint Banner */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-500 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#005CC1] shrink-0" />
                <span>কিবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">D</kbd> চেপে উত্তর দিন | <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 font-bold">→</kbd> চেপে পরবর্তী প্রশ্নে যান</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        <Modal
          open={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          onOk={() => {
            setShowExitConfirm(false)
            setScreen("SELECT")
            if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {})
            }
          }}
          okText="হ্যাঁ, প্রস্থান করুন"
          cancelText="পরীক্ষায় থাকুন"
          okButtonProps={{ danger: true }}
          title="পরীক্ষা প্রস্থান নিশ্চিতকরণ"
        >
          <p className="py-2 text-sm text-slate-600">
            আপনি কি পরীক্ষা থেকে প্রস্থান করতে চান? আপনার বর্তমান উত্তরগুলো সংরক্ষিত নাও থাকতে পারে।
          </p>
        </Modal>

        {/* Submit Confirmation Screen matching User's 2nd Image */}
        {showSubmitConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[99999] bg-white flex items-center justify-center p-6 sm:p-12 overflow-y-auto select-none">
            <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-start text-center">
              {/* Left Column: Confirm Submission */}
              <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed min-h-[4.5rem] flex items-center justify-center">
                  আপনি পরীক্ষা সমাপ্ত করলে কোন প্রশ্নের উত্তর সংশোধন করতে পারবেন না। সমাপ্ত করতে চাইলে নিশ্চিত করুন
                </h3>

                <button
                  type="button"
                  onClick={handleFinishExam}
                  disabled={savingResult}
                  className="bg-[#00965e] hover:bg-[#007d4e] active:scale-95 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingResult ? "সংরক্ষণ হচ্ছে..." : "নিশ্চিত করুন"}
                </button>

                <div className="pt-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#00965e] flex items-center justify-center text-[#00965e] shadow-2xs">
                    <Check className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Right Column: Cancel Submission */}
              <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed min-h-[4.5rem] flex items-center justify-center">
                  আপনি পরীক্ষা সমাপ্ত করতে না চাইলে বাতিল করুন
                </h3>

                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="bg-[#ff2e2e] hover:bg-[#e02424] active:scale-95 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>

                <div className="pt-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#ff2e2e] flex items-center justify-center text-[#ff2e2e] shadow-2xs">
                    <X className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
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
