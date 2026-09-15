"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { message, Popconfirm, Spin } from "antd"
import {
  Users,
  Search,
  Trash2,
  RefreshCw,
  Award,
  Calendar,
  KeyRound,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { cn } from "@/lib/utils"

interface ResultItem {
  id: string
  name: string
  passportNumber: string
  password?: string
  result: string
  createdAt: string
}

// Parse correct score from result string (e.g. "12 / 15", "4/15", "8")
function parseScore(resultStr?: string): { correct: number; isPass: boolean } {
  if (!resultStr) return { correct: 0, isPass: false }
  const match = resultStr.match(/(\d+)/)
  const correct = match ? parseInt(match[1], 10) : 0
  return {
    correct,
    isPass: correct >= 5,
  }
}

// Format date to Bengali-style date-time matching the screenshot (e.g. ১৫/৯/২০২৬, ১২:৫৯:৪৩ PM)
function formatBengaliDateTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString

    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    
    let hours = d.getHours()
    const minutes = d.getMinutes().toString().padStart(2, "0")
    const seconds = d.getSeconds().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12 || 12

    // Bengali numerals mapping
    const bnDigits: Record<string, string> = {
      "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
      "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
    }
    const toBn = (str: string | number) =>
      str.toString().replace(/[0-9]/g, (w) => bnDigits[w] || w)

    return `${toBn(day)}/${toBn(month)}/${toBn(year)}, ${toBn(hours)}:${toBn(minutes)}:${toBn(seconds)} ${ampm}`
  } catch {
    return isoString
  }
}

export default function ExamResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [clearing, setClearing] = useState(false)

  // Auth guard: candidates don't view admin results list
  useEffect(() => {
    if (status === "loading") return
    if (session?.user?.role === "CANDIDATE") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const fetchResults = async () => {
    if (!session?.user?.companyId || session?.user?.role === "CANDIDATE") return
    setLoading(true)
    try {
      const res = await axios.get("/api/exam-results", {
        headers: { "x-company-id": session.user.companyId },
        params: {
          search: search.trim() || undefined,
          limit: 100,
        },
      })
      const items = res.data?.data?.items || []
      setResults(items)
    } catch (error) {
      message.error("ফলাফল লোড করতে ব্যর্থ হয়েছে / Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.companyId && session?.user?.role !== "CANDIDATE") {
      fetchResults()
    }
  }, [session?.user?.companyId, session?.user?.role, search])

  // Clear all results
  const handleClearAll = async () => {
    if (!session?.user?.companyId) return
    setClearing(true)
    try {
      await axios.delete("/api/exam-results", {
        headers: { "x-company-id": session.user.companyId },
      })
      message.success("সকল ফলাফল মুছে ফেলা হয়েছে / All results cleared")
      setResults([])
    } catch (error) {
      message.error("ফলাফল মুছতে সমস্যা হয়েছে")
    } finally {
      setClearing(false)
    }
  }

  // Delete single result
  const handleDeleteItem = async (id: string) => {
    if (!session?.user?.companyId) return
    try {
      await axios.delete(`/api/exam-results?id=${id}`, {
        headers: { "x-company-id": session.user.companyId },
      })
      message.success("ফলাফল মুছে ফেলা হয়েছে")
      setResults((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      message.error("ফলাফল মুছতে সমস্যা হয়েছে")
    }
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "কন্ট্রোল প্যানেল", href: "/dashboard" },
        { label: "পরীক্ষার্থীদের ফলাফল", href: "/dashboard/results" },
      ]}
    >
      <div className="w-full mx-auto space-y-6 font-sans pb-12 px-3 sm:px-6">
        {/* Top Header Card matching the uploaded screenshot */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#005CC1] flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                পরীক্ষার্থীদের ফলাফল
              </h1>
              <p className="text-xs text-slate-500">
                মোট সম্পন্ন পরীক্ষা: <strong className="text-slate-800">{results.length}</strong> টি
              </p>
            </div>
          </div>

          {/* Right: Search + Clear Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box matching placeholder from screenshot */}
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, পাসপোর্ট বা পাসওয়ার্ড দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005CC1]/20 focus:border-[#005CC1] transition-all"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchResults}
              disabled={loading}
              className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            {/* Clear Results Button in Red matching screenshot */}
            <Popconfirm
              title="ফলাফল ক্লিয়ার করুন"
              description="আপনি কি নিশ্চিত যে আপনি সকল প্রার্থীর ফলাফল মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।"
              onConfirm={handleClearAll}
              okText="হ্যাঁ, মুছে ফেলুন"
              cancelText="না"
              okButtonProps={{ danger: true, loading: clearing }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={clearing || results.length === 0}
                className="h-9 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                ফলাফল ক্লিয়ার করুন
              </Button>
            </Popconfirm>
          </div>
        </div>

        {/* Results Table Card matching the uploaded screenshot */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Spin size="large" />
              <p className="text-xs text-slate-400 font-medium">ফলাফল লোড হচ্ছে...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">কোনো পরীক্ষার ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                প্রার্থীরা তাদের ট্রেড পরীক্ষা সম্পন্ন করলে তাদের নাম, পাসপোর্ট, পাসওয়ার্ড ও ফলাফল স্বয়ংক্রিয়ভাবে এখানে প্রদর্শিত হবে।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-700 text-xs sm:text-sm font-bold">
                    <th className="py-4 px-4 sm:px-6">নাম</th>
                    <th className="py-4 px-4 sm:px-6">পাসপোর্ট নম্বর</th>
                    <th className="py-4 px-4 sm:px-6">পাসওয়ার্ড</th>
                    <th className="py-4 px-4 sm:px-6 text-center">ফলাফল</th>
                    <th className="py-4 px-4 sm:px-6 text-center">স্ট্যাটাস</th>
                    <th className="py-4 px-4 sm:px-6">তারিখ ও সময়</th>
                    <th className="py-4 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {results.map((item) => {
                    const { isPass } = parseScore(item.result)
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* 1. নাম */}
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                          {item.name}
                        </td>

                        {/* 2. পাসপোর্ট নম্বর */}
                        <td className="py-4 px-4 sm:px-6 font-mono text-slate-600">
                          {item.passportNumber}
                        </td>

                        {/* 3. পাসওয়ার্ড (Blue font matching image) */}
                        <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#1b64f2]">
                          {item.password || item.passportNumber}
                        </td>

                        {/* 4. ফলাফল (Red if < 5, Green if >= 5) */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <span
                            className={cn(
                              "inline-block font-bold px-3.5 py-1 rounded-full text-xs shadow-2xs border",
                              isPass
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : "bg-rose-50 text-rose-700 border-rose-200/80"
                            )}
                          >
                            {item.result}
                          </span>
                        </td>

                        {/* 5. পাস / ফেল স্ট্যাটাস (Pass if >= 5, Fail if < 5) */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs border shadow-2xs",
                              isPass
                                ? "bg-emerald-100/80 text-emerald-800 border-emerald-300/80"
                                : "bg-rose-100/80 text-rose-800 border-rose-300/80"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isPass ? "bg-emerald-600" : "bg-rose-600"
                              )}
                            />
                            {isPass ? "পাস (Pass)" : "ফেল (Fail)"}
                          </span>
                        </td>

                        {/* 6. তারিখ ও সময় (Bengali localized date matching screenshot) */}
                        <td className="py-4 px-4 sm:px-6 text-slate-600 font-medium">
                          {formatBengaliDateTime(item.createdAt)}
                        </td>

                        {/* 7. Delete Action */}
                        <td className="py-4 px-4 text-right">
                          <Popconfirm
                            title="মুছে ফেলতে চান?"
                            description="এই ফলাফল রেকর্ডটি মুছে ফেলা হবে।"
                            onConfirm={() => handleDeleteItem(item.id)}
                            okText="হ্যাঁ"
                            cancelText="না"
                            okButtonProps={{ danger: true }}
                          >
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Popconfirm>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
