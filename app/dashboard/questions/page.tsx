"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { message, Popconfirm, Drawer, Modal } from "antd"
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  FolderPlus,
  Folder,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  code?: string
  description?: string
  color: string
  questionCount: number
}

interface Option {
  key: string
  text: string
}

interface QuestionItem {
  id: string
  categoryId: string
  categoryName: string
  questionText: string
  type: string
  options: Option[]
  correctAnswer: string
  marks: number
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  status: string
  createdAt: string
}

const PRESET_COLORS = [
  "#1B64F2", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#64748B", // Slate
]

// Reusable Floating Input matching Profile page style
interface FloatingInputProps {
  id: string
  label: string
  value: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  disabled?: boolean
  required?: boolean
  icon?: any
  className?: string
}

function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  icon: Icon,
  className,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString().length > 0
  const isFloated = focused || hasValue

  return (
    <div className={cn("relative group w-full h-12", className)}>
      <input
        id={id}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full h-full rounded-xl border px-4 pt-3.5 pb-1 text-sm font-medium transition-all duration-200 outline-none",
          disabled
            ? "bg-slate-50/80 text-slate-700 border-slate-200 cursor-not-allowed"
            : focused
            ? "border-[#005CC1] ring-4 ring-blue-500/10 bg-white text-slate-900 shadow-xs"
            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800",
          Icon && "pr-11"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 px-1.5 transition-all duration-200 pointer-events-none rounded select-none z-10 whitespace-nowrap text-ellipsis max-w-[calc(100%-2.2rem)] overflow-hidden",
          disabled ? "bg-slate-50 text-slate-400" : "bg-white",
          isFloated
            ? "-top-2.5 text-[11px] font-bold tracking-tight text-[#005CC1]"
            : "top-3.5 text-sm font-normal text-slate-400 group-hover:text-slate-500"
        )}
      >
        {label}
      </label>

      {Icon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

function FloatingTextarea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  disabled = false,
  required = false,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  disabled?: boolean
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value.toString().length > 0
  const isFloated = focused || hasValue

  return (
    <div className="relative group w-full">
      <textarea
        id={id}
        rows={rows}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full rounded-xl border px-4 pt-4 pb-2 text-sm font-medium transition-all duration-200 outline-none resize-none",
          disabled
            ? "bg-slate-50/80 text-slate-700 border-slate-200 cursor-not-allowed"
            : focused
            ? "border-[#005CC1] ring-4 ring-blue-500/10 bg-white text-slate-900 shadow-xs"
            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 px-1.5 transition-all duration-200 pointer-events-none rounded select-none z-10 whitespace-nowrap text-ellipsis max-w-[calc(100%-2.2rem)] overflow-hidden",
          disabled ? "bg-slate-50 text-slate-400" : "bg-white",
          isFloated
            ? "-top-2.5 text-[11px] font-bold tracking-tight text-[#005CC1]"
            : "top-3.5 text-sm font-normal text-slate-400 group-hover:text-slate-500"
        )}
      >
        {label}
      </label>
    </div>
  )
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ label: string; value: string }>
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative group w-full h-12">
      <select
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full h-full rounded-xl border px-4 pt-3.5 pb-1 text-sm font-medium transition-all duration-200 outline-none bg-white cursor-pointer appearance-none",
          focused
            ? "border-[#005CC1] ring-4 ring-blue-500/10 text-slate-900 shadow-xs"
            : "border-slate-200 hover:border-slate-300 text-slate-800"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-3 -top-2.5 px-1.5 text-[11px] font-bold tracking-tight text-[#005CC1] bg-white transition-all duration-200 pointer-events-none rounded select-none z-10"
      >
        {label}
      </label>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  )
}

export default function QuestionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [search, setSearch] = useState("")

  // Question Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [savingQuestion, setSavingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  const [qForm, setQForm] = useState({
    categoryId: "",
    questionText: "",
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
    correctAnswer: "A",
    marks: 1,
    difficulty: "medium" as "easy" | "medium" | "hard",
    explanation: "",
  })

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [savingCat, setSavingCat] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    color: "#1B64F2",
  })

  useEffect(() => {
    if (status === "loading") return
    if (session?.user?.role === "CANDIDATE") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const companyId = session?.user?.companyId

  const fetchCategories = async () => {
    if (!companyId) return
    try {
      const res = await axios.get("/api/question-categories", {
        headers: { "x-company-id": companyId },
      })
      const items: Category[] = res.data.data || []
      setCategories(items)
      if (items.length > 0 && !qForm.categoryId) {
        setQForm((prev) => ({ ...prev, categoryId: items[0].id }))
      }
    } catch (error: any) {
      console.error("Error loading categories:", error)
    }
  }

  const fetchQuestions = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const res = await axios.get("/api/questions", {
        headers: { "x-company-id": companyId },
        params: {
          pageSize: 100,
          search: search || undefined,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        },
      })
      setQuestions(res.data.data || [])
      setTotalCount(res.data.meta?.total || (res.data.data || []).length)
    } catch (error: any) {
      message.error("প্রশ্ন তালিকা লোড করতে ব্যর্থ হয়েছে / Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyId && session?.user?.role !== "CANDIDATE") {
      fetchCategories()
    }
  }, [companyId, session?.user?.role])

  useEffect(() => {
    if (companyId && session?.user?.role !== "CANDIDATE") {
      fetchQuestions()
    }
  }, [companyId, session?.user?.role, selectedCategory, selectedDifficulty, search])

  // Question handlers
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null)
    setQForm({
      categoryId: categories[0]?.id || "",
      questionText: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ],
      correctAnswer: "A",
      marks: 1,
      difficulty: "medium",
      explanation: "",
    })
    setDrawerOpen(true)
  }

  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestionId(q.id)
    setQForm({
      categoryId: q.categoryId,
      questionText: q.questionText,
      options:
        q.options.length >= 4
          ? q.options
          : [
              { key: "A", text: q.options[0]?.text || "" },
              { key: "B", text: q.options[1]?.text || "" },
              { key: "C", text: q.options[2]?.text || "" },
              { key: "D", text: q.options[3]?.text || "" },
            ],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      difficulty: q.difficulty || "medium",
      explanation: q.explanation || "",
    })
    setDrawerOpen(true)
  }

  const handleSaveQuestion = async () => {
    if (!qForm.questionText.trim()) {
      message.error("প্রশ্নের বিবরণ আবশ্যক / Question text is required")
      return
    }
    if (!qForm.categoryId) {
      message.error("ক্যাটাগরি নির্বাচন করুন / Please select category")
      return
    }
    const emptyOpt = qForm.options.some((o) => !o.text.trim())
    if (emptyOpt) {
      message.error("সকল ৪টি উত্তর অপশন পূরণ করুন / Please fill all 4 options")
      return
    }
    if (!qForm.correctAnswer) {
      message.error("সঠিক উত্তর নির্বাচন করুন / Please pick the correct answer")
      return
    }

    setSavingQuestion(true)
    try {
      if (editingQuestionId) {
        await axios.put(`/api/questions/${editingQuestionId}`, qForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("প্রশ্ন সফলভাবে আপডেট হয়েছে! / Question updated successfully!")
      } else {
        await axios.post("/api/questions", qForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("নতুন প্রশ্ন সফলভাবে যুক্ত হয়েছে! / Question created successfully!")
      }
      setDrawerOpen(false)
      fetchQuestions()
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে / Failed to save")
    } finally {
      setSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await axios.delete(`/api/questions/${id}`, {
        headers: { "x-company-id": companyId },
      })
      message.success("প্রশ্ন মুছে ফেলা হয়েছে / Question deleted")
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে / Failed to delete")
    }
  }

  // Category handlers
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) {
      message.error("ক্যাটাগরির নাম দিন / Category name is required")
      return
    }

    setSavingCat(true)
    try {
      if (editingCatId) {
        await axios.put(`/api/question-categories/${editingCatId}`, catForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("ক্যাটাগরি আপডেট করা হয়েছে / Category updated")
      } else {
        await axios.post("/api/question-categories", catForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("নতুন ক্যাটাগরি তৈরি হয়েছে / Category created")
      }
      setCatForm({ name: "", description: "", color: "#1B64F2" })
      setEditingCatId(null)
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "ব্যর্থ হয়েছে / Failed to save category")
    } finally {
      setSavingCat(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    try {
      await axios.delete(`/api/question-categories/${catId}`, {
        headers: { "x-company-id": companyId },
      })
      message.success("ক্যাটাগরি মুছে ফেলা হয়েছে / Category deleted")
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে / Failed to delete")
    }
  }

  if (session?.user?.role === "CANDIDATE") {
    return null
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "প্রশ্ন ব্যাংক / Question Bank" },
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-5 px-3 sm:px-6 py-2">
        
        {/* Header Bar - Clean & Lightweight */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                প্রশ্ন ব্যাংক / Question Bank
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#005CC1] border border-blue-200/60 font-bold text-xs">
                {totalCount} টি প্রশ্ন
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              প্রার্থীদের পরীক্ষার জন্য ট্রেড ও ক্যাটাগরি ভিত্তিক বহুনির্বাচনী প্রশ্ন (MCQ) তৈরি ও পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => {
                setEditingCatId(null)
                setCatForm({ name: "", description: "", color: "#1B64F2" })
                setCatModalOpen(true)
              }}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-10 px-3.5 rounded-xl"
            >
              <FolderPlus className="h-4 w-4 mr-1.5 text-slate-500" />
              ক্যাটাগরি ({categories.length})
            </Button>

            <Button
              onClick={handleOpenAddQuestion}
              className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              নতুন প্রশ্ন তৈরি করুন
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                selectedCategory === "all"
                  ? "bg-[#005CC1] text-white shadow-xs"
                  : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600"
              )}
            >
              <span>সকল প্রশ্ন</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-white text-slate-600"
              )}>
                {totalCount}
              </span>
            </button>

            {categories.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border",
                    active
                      ? "border-transparent text-white shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                  style={{
                    backgroundColor: active ? (cat.color || "#005CC1") : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: active ? "#ffffff" : cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    {cat.questionCount}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Difficulty */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="প্রশ্ন খুঁজুন... / Search by question or option"
                className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#005CC1] focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#005CC1]"
              >
                <option value="all">সকল মাত্রা / All Difficulties</option>
                <option value="easy">সহজ / Easy</option>
                <option value="medium">মাঝারি / Medium</option>
                <option value="hard">কঠিন / Hard</option>
              </select>

              <button
                onClick={() => fetchQuestions()}
                className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 shrink-0"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Questions List Cards */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">প্রশ্ন লোড হচ্ছে... / Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#005CC1] flex items-center justify-center mx-auto shadow-inner">
                <HelpCircle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">কোনো প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                এই ক্যাটাগরিতে এখনও কোনো প্রশ্ন যোগ করা হয়নি। নতুন প্রশ্ন যোগ করতে নিচের বাটনটিতে ক্লিক করুন।
              </p>
              <Button
                onClick={handleOpenAddQuestion}
                className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                প্রথম প্রশ্ন যোগ করুন
              </Button>
            </div>
          ) : (
            questions.map((q, index) => {
              const category = categories.find((c) => c.id === q.categoryId)
              const badgeColor = category?.color || "#1B64F2"

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs hover:shadow-md hover:shadow-blue-500/5 p-5 space-y-3.5"
                >
                  {/* Card Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {q.categoryName}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                        q.difficulty === "easy" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        q.difficulty === "medium" && "bg-amber-50 text-amber-700 border border-amber-200",
                        q.difficulty === "hard" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}>
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        • {q.marks} নম্বর
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#005CC1] hover:bg-blue-50 transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <Popconfirm
                        title="প্রশ্ন মুছে ফেলতে চান?"
                        description="এই প্রশ্নটি স্থায়ীভাবে মুছে ফেলা হবে।"
                        okText="হ্যাঁ, মুছুন"
                        cancelText="বাতিল"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDeleteQuestion(q.id)}
                      >
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>

                  {/* Question Title */}
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {q.questionText}
                  </h2>

                  {/* MCQ 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const isCorrect = opt.key.toUpperCase() === q.correctAnswer.toUpperCase()

                      return (
                        <div
                          key={opt.key}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs sm:text-sm font-medium",
                            isCorrect
                              ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 font-semibold shadow-xs"
                              : "bg-slate-50/60 border-slate-200/80 text-slate-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                              isCorrect
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200"
                            )}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1 min-w-0 break-words">{opt.text}</span>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              সঠিক
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Optional Explanation */}
                  {q.explanation && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">ব্যাখ্যা: </span>
                      <span>{q.explanation}</span>
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Add / Edit Question Drawer with Floating Inputs */}
        <Drawer
          title={
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">
                {editingQuestionId ? "প্রশ্ন সম্পাদনা / Edit Question" : "নতুন প্রশ্ন তৈরি করুন / Create Question"}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                প্রার্থীদের পরীক্ষার জন্য বহুনির্বাচনী প্রশ্ন (MCQ)
              </span>
            </div>
          }
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={540}
          footer={
            <div className="flex items-center justify-end gap-2 p-3 bg-white border-t">
              <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={savingQuestion}>
                বাতিল / Cancel
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={savingQuestion}
                className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-6 shadow-sm"
              >
                {savingQuestion ? "সংরক্ষণ হচ্ছে..." : "প্রশ্ন সংরক্ষণ করুন / Save Question"}
              </Button>
            </div>
          }
        >
          <div className="space-y-5 pt-3">
            
            {/* Category Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">প্রশ্ন ক্যাটাগরি নির্বাচন করুন</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null)
                    setCatForm({ name: "", description: "", color: "#1B64F2" })
                    setCatModalOpen(true)
                  }}
                  className="text-xs font-bold text-[#005CC1] hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  নতুন ক্যাটাগরি
                </button>
              </div>

              <FloatingSelect
                id="q-category"
                label="ক্যাটাগরি / Category *"
                value={qForm.categoryId}
                onChange={(e) => setQForm({ ...qForm, categoryId: e.target.value })}
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </div>

            {/* Question Statement Floating Textarea */}
            <div>
              <FloatingTextarea
                id="q-text"
                label="প্রশ্নের বিবরণ / Question Statement *"
                value={qForm.questionText}
                onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* 4 Options with Letter Pills acting as Correct Answer Selector */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ৪টি উত্তর অপশন / 4 Answer Options *
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  সঠিক উত্তরের বর্ণ বাটনে ক্লিক করুন
                </span>
              </div>

              <div className="space-y-3">
                {qForm.options.map((opt, idx) => {
                  const isChecked = qForm.correctAnswer === opt.key

                  return (
                    <div key={opt.key} className="flex items-center gap-2.5">
                      {/* Interactive Correct Answer Letter Button */}
                      <button
                        type="button"
                        onClick={() => setQForm({ ...qForm, correctAnswer: opt.key })}
                        title={`অপশন ${opt.key} কে সঠিক উত্তর হিসেবে চিহ্নিত করুন`}
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all border",
                          isChecked
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-4 ring-emerald-500/10"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        )}
                      >
                        {isChecked ? (
                          <div className="flex flex-col items-center leading-none">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span className="text-[10px] mt-0.5">{opt.key}</span>
                          </div>
                        ) : (
                          opt.key
                        )}
                      </button>

                      {/* Floating Input for Option Text */}
                      <div className="flex-1">
                        <FloatingInput
                          id={`opt-${opt.key}`}
                          label={`উত্তর অপশন ${opt.key} / Option ${opt.key} *`}
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...qForm.options]
                            newOpts[idx].text = e.target.value
                            setQForm({ ...qForm, options: newOpts })
                          }}
                          required
                          className={isChecked ? "border-emerald-300" : ""}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Marks & Difficulty in 2 Columns */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <FloatingInput
                id="q-marks"
                type="number"
                label="নম্বর / Marks"
                value={qForm.marks}
                onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) || 1 })}
              />

              <FloatingSelect
                id="q-difficulty"
                label="কঠিনতা / Difficulty"
                value={qForm.difficulty}
                onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value as any })}
                options={[
                  { label: "সহজ / Easy", value: "easy" },
                  { label: "মাঝারি / Medium", value: "medium" },
                  { label: "কঠিন / Hard", value: "hard" },
                ]}
              />
            </div>

            {/* Optional Explanation */}
            <div>
              <FloatingInput
                id="q-explanation"
                label="সমাধানের ব্যাখ্যা (ঐচ্ছিক) / Explanation (Optional)"
                value={qForm.explanation}
                onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
              />
            </div>
          </div>
        </Drawer>

        {/* Manage Categories Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-[#005CC1]" />
              <span className="font-bold text-base text-slate-900">
                ক্যাটাগরি পরিচালনা / Question Categories
              </span>
            </div>
          }
          open={catModalOpen}
          onCancel={() => setCatModalOpen(false)}
          footer={null}
          width={500}
        >
          <div className="space-y-5 pt-3">
            {/* Create or Edit Category Form */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingCatId ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি তৈরি করুন / Add New"}
              </span>

              <FloatingInput
                id="cat-name"
                label="ক্যাটাগরির নাম / Category Name *"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
              />

              {/* Color Selector */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">রং নির্বাচন:</span>
                  <div className="flex items-center gap-1.5">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setCatForm({ ...catForm, color: col })}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-transform",
                          catForm.color === col ? "border-slate-800 scale-110 shadow-xs" : "border-transparent"
                        )}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingCatId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingCatId(null)
                        setCatForm({ name: "", description: "", color: "#1B64F2" })
                      }}
                    >
                      বাতিল
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSaveCategory}
                    disabled={savingCat}
                    className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold text-xs px-4 rounded-xl"
                  >
                    {savingCat ? "সংরক্ষণ হচ্ছে..." : editingCatId ? "হালনাগাদ" : "+ যোগ করুন"}
                  </Button>
                </div>
              </div>
            </div>

            {/* List of Existing Categories */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                বর্তমান ক্যাটাগরি তালিকা ({categories.length})
              </span>

              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white max-h-56 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-slate-800 truncate">{cat.name}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                        {cat.questionCount} প্রশ্ন
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id)
                          setCatForm({ name: cat.name, description: cat.description || "", color: cat.color })
                        }}
                        className="p-1 text-slate-400 hover:text-[#005CC1] rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <Popconfirm
                        title="ক্যাটাগরি মুছে ফেলতে চান?"
                        description="ক্যাটাগরির অধীনে প্রশ্ন থাকলে মুছে ফেলা যাবে না।"
                        okText="মুছুন"
                        cancelText="বাতিল"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDeleteCategory(cat.id)}
                      >
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  )
}
