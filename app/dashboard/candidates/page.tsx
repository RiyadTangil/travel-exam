"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { message, Popconfirm } from "antd"
import {
  UserPlus,
  Trash2,
  Users,
  Copy,
  Check,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Button } from "@/components/ui/button"

type Candidate = {
  id: string
  fullName: string
  passportNumber: string
  targetCountry?: string
  trade?: string
  userEmail?: string
  passwordPlain?: string
  createdAt: string
}

export default function CandidatesPage() {
  const { data: session } = useSession()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Quick form fields matching the requested interface
  const [name, setName] = useState("")
  const [passport, setPassport] = useState("")
  const [password, setPassword] = useState("")
  const [targetCountry, setTargetCountry] = useState("")

  const fetchCandidates = async () => {
    if (!session?.user?.companyId) return
    setLoading(true)
    try {
      const res = await axios.get("/api/candidates", {
        headers: { "x-company-id": session.user.companyId },
        params: {
          pageSize: 100,
          search: search || undefined,
        },
      })
      const items = res.data.data.items || []
      setCandidates(items)
    } catch (error: any) {
      message.error("শিক্ষার্থীর তালিকা লোড করতে ব্যর্থ হয়েছে / Failed to load candidates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [session?.user?.companyId, search])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanName = name.trim()
    const cleanPassport = passport.trim().toUpperCase()
    const cleanPassword = password.trim() || cleanPassport // Default password is the passport number

    if (!cleanName) {
      message.warning("শিক্ষার্থীর নাম প্রদান করুন / Please enter student name")
      return
    }
    if (!cleanPassport) {
      message.warning("পাসপোর্ট নম্বর প্রদান করুন / Please enter passport number")
      return
    }
    if (cleanPassword.length < 4) {
      message.warning("পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে / Password minimum 4 characters")
      return
    }

    setSaving(true)
    try {
      await axios.post(
        "/api/candidates",
        {
          fullName: cleanName,
          passportNumber: cleanPassport,
          password: cleanPassword,
          targetCountry: targetCountry.trim() || undefined,
        },
        {
          headers: { "x-company-id": session?.user?.companyId },
        }
      )

      message.success("নতুন শিক্ষার্থীর প্রোফাইল সফলভাবে তৈরি হয়েছে! / Candidate created successfully!")
      setName("")
      setPassport("")
      setPassword("")
      setTargetCountry("")
      fetchCandidates()
    } catch (error: any) {
      message.error(error.response?.data?.message || "প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে / Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/candidates/${id}`, {
        headers: { "x-company-id": session?.user?.companyId },
      })
      message.success("শিক্ষার্থীর প্রোফাইল মুছে ফেলা হয়েছে / Profile deleted")
      setCandidates((prev) => prev.filter((c) => c.id !== id))
    } catch (error: any) {
      message.error("মুছে ফেলতে ব্যর্থ হয়েছে / Failed to delete")
    }
  }

  const handleCopyCredentials = (c: Candidate) => {
    const credText = `Candidate: ${c.fullName}\nPassport: ${c.passportNumber}\nLogin: http://localhost:3000/auth/signin`
    navigator.clipboard.writeText(credText)
    setCopiedId(c.id)
    message.success("লগইন তথ্য কপি করা হয়েছে / Credentials copied!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getInitial = (fullName: string) => {
    if (!fullName) return "S"
    const parts = fullName.trim().split(" ")
    return (parts[0]?.[0] || "S").toUpperCase()
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "শিক্ষার্থীর প্রোফাইল / Candidate Profiles" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-2">
        {/* Top Card: Create New Student Profile (+ নতুন শিক্ষার্থীর প্রোফাইল তৈরি করুন) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg sm:text-xl">
              <span className="text-2xl leading-none">+</span>
              <span>নতুন শিক্ষার্থীর প্রোফাইল তৈরি করুন</span>
              <span className="text-xs text-slate-400 font-normal ml-1">/ Add Candidate</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Field 1: Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">
                    শিক্ষার্থীর নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম... / e.g. Mamun"
                    required
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Field 2: Passport Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">
                    পাসপোর্ট নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passport}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase()
                      setPassport(val)
                      // If password hasn't been explicitly typed, default password to passport
                      if (!password || password === passport) {
                        setPassword(val)
                      }
                    }}
                    placeholder="পাসপোর্ট... / e.g. A12345678"
                    required
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 font-mono font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 uppercase"
                  />
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">
                    লগইন পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড... / Default: Passport"
                    required
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Primary Action Button matching image */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-[#1B64F2] hover:bg-[#1554d1] text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                {saving ? "প্রোফাইল সেভ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Card: Student List (শিক্ষার্থীর তালিকা) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Users className="h-5 w-5 text-slate-500" />
              <span>শিক্ষার্থীর তালিকা ({candidates.length})</span>
            </div>

            {/* Quick search */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="খুঁজুন... / Search"
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                লোড হচ্ছে... / Loading students...
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-medium text-sm">কোনো শিক্ষার্থীর প্রোফাইল পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400">উপরের ফর্ম থেকে নতুন শিক্ষার্থীর প্রোফাইল তৈরি করুন</p>
              </div>
            ) : (
              candidates.map((c) => (
                <div
                  key={c.id}
                  className="px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle Avatar with Letter */}
                    <div className="w-10 h-10 rounded-full bg-blue-100/90 text-blue-700 font-bold flex items-center justify-center shrink-0 text-base shadow-xs">
                      {getInitial(c.fullName)}
                    </div>

                    {/* Name and Credentials */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                        {c.fullName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span>
                          পাসপোর্ট: <strong className="font-mono text-slate-700">{c.passportNumber}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          পাসওয়ার্ড:{" "}
                          <strong className="font-mono font-bold text-blue-600">
                            {c.passportNumber}
                          </strong>
                        </span>
                        {c.targetCountry && (
                          <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {c.targetCountry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(c)}
                      title="Copy Login Credentials"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {copiedId === c.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <Popconfirm
                      title="মুছে ফেলতে নিশ্চিত?"
                      description="আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর প্রোফাইল মুছে ফেলতে চান?"
                      okText="হ্যাঁ, মুছুন"
                      cancelText="বাতিল"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(c.id)}
                    >
                      <button
                        type="button"
                        title="Delete Profile"
                        className="p-1.5 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
