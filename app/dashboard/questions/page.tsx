"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Image as AntImage, message, Popconfirm, Drawer, Modal, Popover, InputNumber } from "antd"
import imageCompression from "browser-image-compression"
import { motion, AnimatePresence } from "framer-motion"
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
  ChevronUp,
  Layers,
  Sparkles,
  Shuffle,
  UploadCloud,
  ImageIcon,
  X,
  Loader2,
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
  imageUrl?: string
  imageKey?: string
  type: string
  options: Option[]
  correctAnswer: string
  marks: number
  order?: number
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  status: string
  createdAt: string
}

function QuestionPositionControl({
  index,
  total,
  disabled,
  onMove,
  onDirectChange,
}: {
  index: number
  total: number
  disabled?: boolean
  onMove: (curr: number, target: number) => void
  onDirectChange: (curr: number, newPos: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [targetNum, setTargetNum] = useState<number | null>(index + 1)

  useEffect(() => {
    setTargetNum(index + 1)
  }, [index])

  const handleApply = () => {
    if (targetNum !== null && targetNum >= 1 && targetNum <= total) {
      onDirectChange(index, targetNum)
      setOpen(false)
    } else {
      message.warning(`১ থেকে ${total}-এর মধ্যে নম্বর লিখুন`)
    }
  }

  return (
    <div className="flex items-center gap-0.5 bg-slate-100/90 hover:bg-slate-100 rounded-xl p-0.5 border border-slate-200/80 shadow-2xs">
      {/* Up Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMove(index, index - 1)
        }}
        disabled={index === 0 || disabled}
        className={cn(
          "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
          index === 0 || disabled
            ? "text-slate-300 cursor-not-allowed opacity-30"
            : "text-slate-600 hover:text-[#005CC1] hover:bg-white hover:shadow-2xs active:scale-95 cursor-pointer"
        )}
        title="উপরে নিন (Move Up)"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Direct number click / popover */}
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger="click"
        placement="bottom"
        content={
          <div className="p-2 space-y-2.5 w-52">
            <div className="text-xs font-bold text-slate-800">
              প্রশ্নের নম্বর / অবস্থান পরিবর্তন
            </div>
            <div className="text-[11px] text-slate-500">
              বর্তমান অবস্থান: <strong className="text-[#005CC1]">#{index + 1}</strong>
            </div>
            <div className="flex items-center gap-2">
              <InputNumber
                min={1}
                max={total}
                value={targetNum}
                onChange={(val) => setTargetNum(val)}
                onPressEnter={handleApply}
                className="w-full text-xs font-bold rounded-lg"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-[#005CC1] hover:bg-[#004ca3] text-white text-xs px-3 h-8 rounded-lg shadow-xs"
              >
                যাও
              </Button>
            </div>
            <div className="text-[10px] text-slate-400">
              ১ থেকে {total}-এর মধ্যে যে কোনো নম্বর লিখুন
            </div>
          </div>
        }
      >
        <button
          type="button"
          className="min-w-6 h-6 px-1.5 rounded-lg bg-white text-slate-800 font-extrabold text-xs flex items-center justify-center shadow-2xs hover:bg-blue-50 hover:text-[#005CC1] hover:border-blue-300 border border-slate-200/70 transition-all cursor-pointer group"
          title="নম্বর পরিবর্তন করতে ক্লিক করুন"
        >
          <span>{index + 1}</span>
        </button>
      </Popover>

      {/* Down Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMove(index, index + 1)
        }}
        disabled={index === total - 1 || disabled}
        className={cn(
          "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
          index === total - 1 || disabled
            ? "text-slate-300 cursor-not-allowed opacity-30"
            : "text-slate-600 hover:text-[#005CC1] hover:bg-white hover:shadow-2xs active:scale-95 cursor-pointer"
        )}
        title="নিচে নিন (Move Down)"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

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
    imageUrl: "",
    imageKey: "",
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

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      message.error("প্রশ্ন তালিকা লোড করতে ব্যর্থ হয়েছে")
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

  // Option Dynamic Handlers
  const handleAddOption = () => {
    if (qForm.options.length >= 8) {
      message.warning("সর্বোচ্চ ৮টি অপশন যোগ করা যাবে")
      return
    }
    const nextIdx = qForm.options.length
    const nextKey = LETTERS[nextIdx] || String.fromCharCode(65 + nextIdx)
    setQForm((prev) => ({
      ...prev,
      options: [...prev.options, { key: nextKey, text: "" }],
    }))
  }

  const handleRemoveOption = (indexToRemove: number) => {
    if (qForm.options.length <= 2) {
      message.warning("কমপক্ষে ২টি উত্তর অপশন আবশ্যক")
      return
    }

    const removedKey = qForm.options[indexToRemove].key
    const filtered = qForm.options.filter((_, idx) => idx !== indexToRemove)
    const reindexed = filtered.map((opt, idx) => ({
      key: LETTERS[idx] || String.fromCharCode(65 + idx),
      text: opt.text,
    }))

    let newAnswer = qForm.correctAnswer
    if (qForm.correctAnswer === removedKey) {
      newAnswer = reindexed[0]?.key || "A"
    } else {
      const oldIdx = qForm.options.findIndex((o) => o.key === qForm.correctAnswer)
      if (oldIdx > indexToRemove) {
        newAnswer = LETTERS[oldIdx - 1] || "A"
      }
    }

    setQForm((prev) => ({
      ...prev,
      options: reindexed,
      correctAnswer: newAnswer,
    }))
  }

  const handleSetPresetOptions = (count: number) => {
    if (count === 2) {
      setQForm((prev) => ({
        ...prev,
        options: [
          { key: "A", text: "সত্য (True)" },
          { key: "B", text: "মিথ্যা (False)" },
        ],
        correctAnswer: "A",
      }))
    } else if (count === 4) {
      setQForm((prev) => {
        const existing = prev.options
        const opts = [
          { key: "A", text: existing[0]?.text || "" },
          { key: "B", text: existing[1]?.text || "" },
          { key: "C", text: existing[2]?.text || "" },
          { key: "D", text: existing[3]?.text || "" },
        ]
        const validAns = opts.some((o) => o.key === prev.correctAnswer) ? prev.correctAnswer : "A"
        return {
          ...prev,
          options: opts,
          correctAnswer: validAns,
        }
      })
    }
  }

  // Image Upload with Client Compression & MongoDB GridFS Storage
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      message.error("অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন")
      return
    }

    setIsUploadingImage(true)
    setUploadError(null)

    try {
      // 1. Compress image with browser-image-compression
      let fileToUpload: File = file
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: file.type.includes("png") ? "image/png" : "image/jpeg",
        })
        fileToUpload = new File([compressed], file.name, {
          type: compressed.type || file.type,
        })
      } catch (compErr) {
        console.warn("Client image compression fallback:", compErr)
      }

      // 2. Direct upload to MongoDB GridFS via FormData (No AWS required)
      const formData = new FormData()
      formData.append("file", fileToUpload)

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const { publicUrl, fileKey } = uploadRes.data.data

      setQForm((prev) => ({
        ...prev,
        imageUrl: publicUrl,
        imageKey: fileKey,
      }))
      message.success("ছবি MongoDB-তে সফলভাবে সংরক্ষিত হয়েছে!")
    } catch (err: any) {
      console.error("Image upload error:", err)
      setUploadError(err.message || "ছবি আপলোড ব্যর্থ হয়েছে")
      message.error("ছবি আপলোড ব্যর্থ হয়েছে")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (qForm.imageKey || qForm.imageUrl) {
      try {
        await axios.delete("/api/upload", {
          params: { key: qForm.imageKey || qForm.imageUrl },
        })
      } catch (err) {
        console.warn("Could not delete from MongoDB immediately:", err)
      }
    }
    setQForm((prev) => ({
      ...prev,
      imageUrl: "",
      imageKey: "",
    }))
    setUploadError(null)
  }

  // Question handlers
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null)
    setQForm({
      categoryId: categories[0]?.id || "",
      questionText: "",
      imageUrl: "",
      imageKey: "",
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
    setUploadError(null)
    setDrawerOpen(true)
  }

  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestionId(q.id)
    setQForm({
      categoryId: q.categoryId,
      questionText: q.questionText,
      imageUrl: q.imageUrl || "",
      imageKey: q.imageKey || "",
      options:
        Array.isArray(q.options) && q.options.length >= 2
          ? q.options.map((opt, idx) => ({
              key: opt.key || LETTERS[idx] || String.fromCharCode(65 + idx),
              text: opt.text || "",
            }))
          : [
              { key: "A", text: "" },
              { key: "B", text: "" },
            ],
      correctAnswer: q.correctAnswer || "A",
      marks: q.marks || 1,
      difficulty: q.difficulty || "medium",
      explanation: q.explanation || "",
    })
    setUploadError(null)
    setDrawerOpen(true)
  }

  const handleSaveQuestion = async () => {
    if (!qForm.questionText.trim()) {
      message.error("প্রশ্নের বিবরণ আবশ্যক")
      return
    }
    if (!qForm.categoryId) {
      message.error("ক্যাটাগরি নির্বাচন করুন")
      return
    }

    // Auto-filter blank options so if user only filled 2 options, we automatically discard empty ones
    const filledOptions = qForm.options
      .map((o) => ({ ...o, text: o.text.trim() }))
      .filter((o) => o.text.length > 0)
      .map((opt, idx) => ({
        key: LETTERS[idx] || String.fromCharCode(65 + idx),
        text: opt.text,
      }))

    if (filledOptions.length < 2) {
      message.error("কমপক্ষে ২টি উত্তর অপশন পূরণ করুন")
      return
    }

    // Match correct answer among filled options
    let selectedAnswer = qForm.correctAnswer
    const originalSelected = qForm.options.find((o) => o.key === qForm.correctAnswer)
    const matchedOpt = filledOptions.find((o) => o.text === originalSelected?.text)
    if (matchedOpt) {
      selectedAnswer = matchedOpt.key
    } else if (!filledOptions.some((o) => o.key === selectedAnswer)) {
      selectedAnswer = filledOptions[0].key
    }

    const payload = {
      ...qForm,
      options: filledOptions,
      correctAnswer: selectedAnswer,
    }

    setSavingQuestion(true)
    try {
      if (editingQuestionId) {
        await axios.put(`/api/questions/${editingQuestionId}`, payload, {
          headers: { "x-company-id": companyId },
        })
        message.success("প্রশ্ন সফলভাবে আপডেট হয়েছে!")
      } else {
        await axios.post("/api/questions", payload, {
          headers: { "x-company-id": companyId },
        })
        message.success("নতুন প্রশ্ন সফলভাবে যুক্ত হয়েছে!")
      }
      setDrawerOpen(false)
      fetchQuestions()
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে")
    } finally {
      setSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await axios.delete(`/api/questions/${id}`, {
        headers: { "x-company-id": companyId },
      })
      message.success("প্রশ্ন এবং ছবি মুছে ফেলা হয়েছে")
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে")
    }
  }

  // Category handlers
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) {
      message.error("ক্যাটাগরির নাম দিন")
      return
    }

    setSavingCat(true)
    try {
      if (editingCatId) {
        await axios.put(`/api/question-categories/${editingCatId}`, catForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("ক্যাটাগরি আপডেট করা হয়েছে")
      } else {
        await axios.post("/api/question-categories", catForm, {
          headers: { "x-company-id": companyId },
        })
        message.success("নতুন ক্যাটাগরি তৈরি হয়েছে")
      }
      setCatForm({ name: "", description: "", color: "#1B64F2" })
      setEditingCatId(null)
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "ব্যর্থ হয়েছে")
    } finally {
      setSavingCat(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    try {
      await axios.delete(`/api/question-categories/${catId}`, {
        headers: { "x-company-id": companyId },
      })
      message.success("ক্যাটাগরি মুছে ফেলা হয়েছে")
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে")
    }
  }



  const [reordering, setReordering] = useState(false)
  const [shuffling, setShuffling] = useState(false)

  // Smart Shuffle / Jumble function using Fisher-Yates algorithm
  const handleShuffleQuestions = async () => {
    if (questions.length <= 1) {
      message.info("শাফল করার জন্য কমপক্ষে ২টি প্রশ্ন থাকতে হবে")
      return
    }

    // Fisher-Yates Shuffle
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Immediate optimistic update for smooth Framer Motion layout animation
    setQuestions(shuffled)

    const items = shuffled.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }))

    setShuffling(true)
    try {
      await axios.put(
        "/api/questions/reorder",
        { items },
        { headers: { "x-company-id": companyId } }
      )
      message.success("প্রশ্নগুলোর ক্রম সফলভাবে এলোমেলো (Shuffled) করা হয়েছে!")
    } catch (err: any) {
      console.error("Failed to persist shuffled order:", err)
      message.error("শাফল সংরক্ষণ করতে ব্যর্থ হয়েছে")
      fetchQuestions()
    } finally {
      setShuffling(false)
    }
  }

  const handleMoveQuestion = async (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= questions.length || currentIndex === targetIndex) {
      return
    }

    const updated = [...questions]
    const [movedItem] = updated.splice(currentIndex, 1)
    updated.splice(targetIndex, 0, movedItem)

    // Immediate optimistic update for smooth Framer Motion layout transition
    setQuestions(updated)

    const items = updated.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }))

    try {
      setReordering(true)
      await axios.put(
        "/api/questions/reorder",
        { items },
        { headers: { "x-company-id": companyId } }
      )
    } catch (err: any) {
      console.error("Failed to persist question order:", err)
      message.error("প্রশ্নের অবস্থান সংরক্ষণে সমস্যা হয়েছে")
      fetchQuestions()
    } finally {
      setReordering(false)
    }
  }

  const handleDirectPositionChange = async (currentIndex: number, newPositionOneBased: number) => {
    const targetIndex = newPositionOneBased - 1
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= questions.length) {
      message.warning(`অনুগ্রহ করে ১ থেকে ${questions.length}-এর মধ্যে একটি নম্বর লিখুন`)
      return
    }
    await handleMoveQuestion(currentIndex, targetIndex)
  }

  if (session?.user?.role === "CANDIDATE") {
    return null
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "প্রশ্ন ব্যাংক" },
      ]}
    >
      <div className=" mx-auto space-y-5 px-3 sm:px-6 py-2">
        
        {/* Top Header Bar (Sticky) */}
        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                প্রশ্ন ব্যাংক
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
            <Popconfirm
              title="প্রশ্নের ক্রম এলোমেলো করুন (Shuffle / Jumble)"
              description="আপনি কি বর্তমান তালিকার সকল প্রশ্নের ক্রম এলোমেলো করতে চান?"
              onConfirm={handleShuffleQuestions}
              okText="হ্যাঁ, শাফল করুন"
              cancelText="বাতিল"
              okButtonProps={{ loading: shuffling, className: "bg-[#005CC1]" }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={shuffling || questions.length <= 1}
                className="border-slate-200 text-slate-700 hover:text-[#005CC1] hover:border-blue-300 font-semibold text-xs h-10 px-3.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all bg-white"
                title="প্রশ্নের ক্রম এলোমেলো বা জাম্বল করুন"
              >
                <Shuffle className={`h-4 w-4 ${shuffling ? "animate-spin text-[#005CC1]" : "text-slate-500"}`} />
                <span>{shuffling ? "শাফল হচ্ছে..." : "শাফল করুন"}</span>
              </Button>
            </Popconfirm>

            <Button
              onClick={handleOpenAddQuestion}
              className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              নতুন প্রশ্ন তৈরি করুন
            </Button>
          </div>
        </div>

        {/* 2-Column Main Layout: Left Category Nav + Right Questions Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Side: Category Navigation Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 h-fit z-10">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col max-h-[calc(100vh-7rem)]">
              
              {/* Category Nav Header */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2.5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-[#005CC1]" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ক্যাটাগরি সমূহ
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    ({categories.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null)
                    setCatForm({ name: "", description: "", color: "#1B64F2" })
                    setCatModalOpen(true)
                  }}
                  className="text-[11px] font-bold text-[#005CC1] hover:text-[#004ca3] flex items-center gap-1 transition-colors hover:underline"
                  title="ক্যাটাগরি সম্পাদনা বা পরিচালনা"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>নতুন ক্যাটাগরি</span>
                </button>
              </div>

              {/* Category Nav List */}
              <div className="space-y-1 overflow-y-auto flex-1 py-2 pr-1">
                {/* All Questions Item */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group",
                    selectedCategory === "all"
                      ? "bg-[#005CC1] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        selectedCategory === "all" ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span className="truncate">সকল প্রশ্ন</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {totalCount}
                  </span>
                </button>

                {/* Individual Categories */}
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id
                  const cleanName = (cat.name || "").split("/")[0].trim()

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group",
                        active
                          ? "bg-[#005CC1] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: active ? "#ffffff" : cat.color || "#005CC1",
                          }}
                        />
                        <span className="truncate">{cleanName}</span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {cat.questionCount}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Add Category Shortcut at bottom of nav */}
              <div className="pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null)
                    setCatForm({ name: "", description: "", color: "#1B64F2" })
                    setCatModalOpen(true)
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:text-[#005CC1] hover:border-blue-300 hover:bg-blue-50/50 text-xs font-semibold transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>নতুন ক্যাটাগরি যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Search, Filters & Question Cards */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="প্রশ্ন বা অপশন খুঁজুন..."
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm outline-none focus:bg-white focus:border-[#005CC1] focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#005CC1]"
                  >
                    <option value="all">সকল মাত্রা</option>
                    <option value="easy">সহজ</option>
                    <option value="medium">মাঝারি</option>
                    <option value="hard">কঠিন</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => fetchQuestions()}
                    className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 shrink-0"
                    title="রিফ্রেশ"
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
              <p className="text-xs text-slate-500 font-medium">প্রশ্ন লোড হচ্ছে...</p>
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
            <AnimatePresence mode="popLayout">
              {questions.map((q, index) => {
                const category = categories.find((c) => c.id === q.categoryId)
                const badgeColor = category?.color || "#1B64F2"
                const cleanCatName = (q.categoryName || category?.name || "সাধারণ").split("/")[0].trim()

                const difficultyLabel =
                  q.difficulty === "easy" ? "সহজ" : q.difficulty === "medium" ? "মাঝারি" : "কঠিন"

                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      layout: { type: "spring", stiffness: 350, damping: 28 },
                      opacity: { duration: 0.2 },
                    }}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs hover:shadow-md hover:shadow-blue-500/5 p-5 space-y-3.5"
                  >
                    {/* Card Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <QuestionPositionControl
                          index={index}
                          total={questions.length}
                          disabled={reordering}
                          onMove={handleMoveQuestion}
                          onDirectChange={handleDirectPositionChange}
                        />
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {cleanCatName}
                        </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider",
                        q.difficulty === "easy" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        q.difficulty === "medium" && "bg-amber-50 text-amber-700 border border-amber-200",
                        q.difficulty === "hard" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}>
                        {difficultyLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        • {q.marks} নম্বর
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#005CC1] hover:bg-blue-50 transition-colors"
                        title="সম্পাদনা করুন"
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
                          title="মুছে ফেলুন"
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

                  {/* Optional Question Image Card */}
                  {q.imageUrl && (
                    <div className="pt-1 pb-1">
                      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 max-w-sm sm:max-w-md shadow-2xs">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5 text-[#005CC1]" />
                            প্রশ্নের চিত্র / ছবি
                          </span>
                          <span className="text-[11px] font-semibold text-[#005CC1] flex items-center gap-1">
                            ক্লিক করে জুম করুন
                          </span>
                        </div>
                        <div className="w-full h-44 sm:h-52 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center overflow-hidden p-2 group relative">
                          <AntImage
                            src={q.imageUrl}
                            alt={q.questionText}
                            height="100%"
                            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                            className="rounded-lg transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                            preview={{
                              mask: (
                                <div className="flex items-center gap-1.5 text-xs text-white font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs shadow-md">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  পূর্ণ আকারে দেখুন
                                </div>
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options Grid */}
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
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>

        {/* Add / Edit Question Drawer with Floating Inputs */}
        <Drawer
          title={
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">
                {editingQuestionId ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন তৈরি করুন"}
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
                বাতিল
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={savingQuestion}
                className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-6 shadow-sm"
              >
                {savingQuestion ? "সংরক্ষণ হচ্ছে..." : "প্রশ্ন সংরক্ষণ করুন"}
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
                label="ক্যাটাগরি *"
                value={qForm.categoryId}
                onChange={(e) => setQForm({ ...qForm, categoryId: e.target.value })}
                options={categories.map((c) => ({
                  label: (c.name || "").split("/")[0].trim(),
                  value: c.id,
                }))}
              />
            </div>

            {/* Question Statement Floating Textarea */}
            <div>
              <FloatingTextarea
                id="q-text"
                label="প্রশ্নের বিবরণ *"
                value={qForm.questionText}
                onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Question Image (Optional) with compression & preview */}
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-[#005CC1]" />
                  প্রশ্নের ছবি (ঐচ্ছিক)
                </span>
                {qForm.imageUrl && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    ছবি সংযুক্ত আছে
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {qForm.imageUrl ? (
                <div className="relative rounded-2xl border border-slate-200/90 p-2.5 bg-slate-50/50 flex items-center gap-3">
                  <div className="h-16 w-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1">
                    <AntImage
                      src={qForm.imageUrl}
                      alt="Preview"
                      height="100%"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {qForm.imageKey || "সংযুক্ত ছবি"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      স্বয়ংক্রিয়ভাবে অপটিমাইজ ও কম্প্রেস করা হয়েছে
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="h-8 text-xs font-semibold px-2.5 rounded-xl border-slate-200 hover:bg-white"
                    >
                      পরিবর্তন
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isUploadingImage}
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                      title="ছবি সরান"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer border-2 border-dashed rounded-2xl p-4 text-center transition-all",
                    isUploadingImage
                      ? "border-blue-300 bg-blue-50/40"
                      : "border-slate-200 hover:border-[#005CC1] hover:bg-blue-50/20 bg-slate-50/40"
                  )}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center py-2 space-y-2">
                      <Loader2 className="h-6 w-6 text-[#005CC1] animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">ছবি অপটিমাইজ ও আপলোড হচ্ছে...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#005CC1] flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-800 hover:text-[#005CC1]">
                          প্রশ্নের জন্য ছবি আপলোড করতে ক্লিক করুন
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          PNG, JPG, WebP (ব্রাউজারেই কম্প্রেসড ও অপটিমাইজড হবে)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {uploadError && (
                <p className="text-[11px] font-semibold text-rose-500">{uploadError}</p>
              )}
            </div>

            {/* Dynamic Options with Letter Pills acting as Correct Answer Selector */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    উত্তর অপশন ({qForm.options.length} টি) *
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPresetOptions(4)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all",
                        qForm.options.length === 4
                          ? "bg-blue-50 text-[#005CC1] border-blue-200 font-black"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      )}
                      title="৪টি অপশন সেট করুন"
                    >
                      MCQ (৪)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetOptions(2)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all",
                        qForm.options.length === 2
                          ? "bg-blue-50 text-[#005CC1] border-blue-200 font-black"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      )}
                      title="সত্য / মিথ্যা সেট করুন"
                    >
                      সত্য/মিথ্যা (২)
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={qForm.options.length >= 8}
                  className="h-7 text-xs font-bold text-[#005CC1] border-blue-200 hover:bg-blue-50 hover:border-[#005CC1] flex items-center gap-1 px-2.5 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  অপশন যোগ করুন
                </Button>
              </div>

              <div className="space-y-3">
                {qForm.options.map((opt, idx) => {
                  const isChecked = qForm.correctAnswer === opt.key

                  return (
                    <div key={opt.key} className="flex items-center gap-2">
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
                          label={`অপশন ${opt.key} এর উত্তর *`}
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

                      {/* Delete Option Button (available if more than 2 options) */}
                      {qForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          title={`অপশন ${opt.key} বাদ দিন`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>সঠিক উত্তরের বর্ণ বাটনে ক্লিক করুন। প্রয়োজন অনুযায়ী অপশন যোগ বা বাদ দিন (কমপক্ষে ২টি)।</span>
              </p>
            </div>

            {/* Marks & Difficulty in 2 Columns */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <FloatingInput
                id="q-marks"
                type="number"
                label="নম্বর"
                value={qForm.marks}
                onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) || 1 })}
              />

              <FloatingSelect
                id="q-difficulty"
                label="কঠিনতার মাত্রা"
                value={qForm.difficulty}
                onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value as any })}
                options={[
                  { label: "সহজ", value: "easy" },
                  { label: "মাঝারি", value: "medium" },
                  { label: "কঠিন", value: "hard" },
                ]}
              />
            </div>

            {/* Optional Explanation */}
            <div>
              <FloatingInput
                id="q-explanation"
                label="সমাধানের ব্যাখ্যা (ঐচ্ছিক)"
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
                ক্যাটাগরি পরিচালনা
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
                {editingCatId ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি তৈরি করুন"}
              </span>

              <FloatingInput
                id="cat-name"
                label="ক্যাটাগরির নাম *"
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
                {categories.map((cat) => {
                  const cleanCatName = (cat.name || "").split("/")[0].trim()
                  return (
                    <div key={cat.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-bold text-slate-800 truncate">{cleanCatName}</span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                          {cat.questionCount} প্রশ্ন
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id)
                            setCatForm({ name: cleanCatName, description: cat.description || "", color: cat.color })
                          }}
                          className="p-1 text-slate-400 hover:text-[#005CC1] rounded"
                          title="সম্পাদনা"
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
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  )
}
