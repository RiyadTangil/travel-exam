"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { message, Popconfirm, Drawer, Checkbox } from "antd"
import {
  UserPlus,
  Trash2,
  Users,
  Shield,
  Search,
  RefreshCw,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingInputProps {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: any;
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
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const isFloated = focused || hasValue;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative group w-full h-12">
      <input
        id={id}
        type={inputType}
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
          (Icon || isPassword) && "pr-11"
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

      {isPassword && !disabled && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}

      {Icon && !isPassword && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

type StaffUser = {
  id: string
  fullName: string
  userEmail: string
  mobile?: string
  userRole: string
  status: string
  createdAt: string
}

const MODULES = [
  { key: "candidates", label: "শিক্ষার্থী ও পরীক্ষা / Candidates & Exams" },
  { key: "dashboard", label: "কন্ট্রোল প্যানেল / Dashboard" },
  { key: "company", label: "আমার এজেন্সি / My Company" },
]

export default function StaffPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    userEmail: "",
    password: "",
    mobile: "",
  })

  const [perms, setPerms] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({
    candidates: { read: true, write: true, delete: true },
    dashboard: { read: true, write: true, delete: false },
    company: { read: true, write: false, delete: false },
  })

  useEffect(() => {
    if (status === "loading") return
    if (session?.user?.role === "CANDIDATE") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const fetchStaff = async () => {
    if (!session?.user?.companyId || session?.user?.role === "CANDIDATE") return
    setLoading(true)
    try {
      const res = await axios.get("/api/staff", {
        headers: { "x-company-id": session.user.companyId },
        params: {
          pageSize: 100,
          search: search || undefined,
        },
      })
      setStaffList(res.data.data.items || [])
    } catch (error: any) {
      message.error("স্টাফ তালিকা লোড করতে ব্যর্থ হয়েছে / Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role !== "CANDIDATE") {
      fetchStaff()
    }
  }, [session?.user?.companyId, session?.user?.role, search])

  const handleCreateStaff = async () => {
    if (!formData.fullName.trim()) {
      message.error("স্টাফের পুরো নাম দিন / Enter staff full name")
      return
    }
    if (!formData.userEmail.trim()) {
      message.error("ইমেইল ঠিকানা দিন / Enter email address")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail.trim())) {
      message.error("সঠিক ইমেইল দিন / Enter a valid email address")
      return
    }
    if (!formData.password || formData.password.length < 6) {
      message.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে / Min 6 characters password")
      return
    }

    setSaving(true)
    try {
      await axios.post(
        "/api/staff",
        {
          fullName: formData.fullName.trim(),
          userEmail: formData.userEmail.trim(),
          password: formData.password,
          mobile: formData.mobile.trim() || undefined,
          userRole: "C_ADMIN",
          permissions: perms,
        },
        {
          headers: { "x-company-id": session?.user?.companyId },
        }
      )

      message.success("নতুন স্টাফ সফলভাবে যুক্ত হয়েছে! / Staff added successfully!")
      setFormData({ fullName: "", userEmail: "", password: "", mobile: "" })
      setDrawerOpen(false)
      fetchStaff()
    } catch (error: any) {
      message.error(error.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে / Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/staff/${id}`, {
        headers: { "x-company-id": session?.user?.companyId },
      })
      message.success("স্টাফ একাউন্ট মুছে ফেলা হয়েছে / Staff deleted")
      setStaffList((prev) => prev.filter((s) => s.id !== id))
    } catch (error: any) {
      message.error(error.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে / Failed to delete")
    }
  }

  const handleTogglePerm = (key: string, action: "read" | "write" | "delete", val: boolean) => {
    setPerms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [action]: val,
      },
    }))
  }

  if (session?.user?.role === "CANDIDATE") {
    return null
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "স্টাফ ও টিম / Staff Management" },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              স্টাফ ও টিম সদস্য / Agency Staff Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage agency co-admins and examiners with direct module permissions.
            </p>
          </div>

          <Button
            onClick={() => {
              setFormData({ fullName: "", userEmail: "", password: "", mobile: "" })
              setDrawerOpen(true)
            }}
            className="bg-[#1B64F2] hover:bg-[#1554d1] text-white shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            + নতুন স্টাফ যুক্ত করুন / Add Staff
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="স্টাফ খুঁজুন... / Search by name, email"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => fetchStaff()}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Staff Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">লোড হচ্ছে... / Loading staff...</div>
            ) : staffList.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <Users className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-medium text-sm">কোনো স্টাফ একাউন্ট পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400">নতুন স্টাফ যুক্ত করতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              staffList.map((s, idx) => {
                const isSelf = s.id === session?.user?.id
                return (
                  <div
                    key={s.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {s.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                          {isSelf && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {s.userEmail}
                          </span>
                          {s.mobile && s.mobile !== "—" && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{s.mobile}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                        Agency Staff
                      </span>

                      {!isSelf && (
                        <Popconfirm
                          title="মুছে ফেলতে নিশ্চিত?"
                          description="আপনি কি নিশ্চিতভাবে এই স্টাফ একাউন্ট মুছে ফেলতে চান?"
                          okText="হ্যাঁ, মুছুন"
                          cancelText="বাতিল"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDelete(s.id)}
                        >
                          <button
                            type="button"
                            className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Add Staff Drawer */}
        <Drawer
          title={
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">নতুন স্টাফ যুক্ত করুন / Add Staff Member</span>
              <span className="text-xs text-slate-500 font-normal">
                Direct access without complex pre-created roles
              </span>
            </div>
          }
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={560}
          footer={
            <div className="flex justify-end gap-2 p-3 bg-white border-t">
              <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
                বাতিল / Cancel
              </Button>
              <Button onClick={handleCreateStaff} disabled={saving} className="bg-[#1B64F2] hover:bg-[#1554d1] text-white">
                {saving ? "সংরক্ষণ হচ্ছে..." : "স্টাফ সংরক্ষণ করুন / Save Staff"}
              </Button>
            </div>
          }
        >
          <div className="space-y-5 pt-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#005CC1]" />
                স্টাফের তথ্য / Staff Information
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click field to edit</span>
            </div>

            <FloatingInput
              id="staff-fullName"
              label="স্টাফের পুরো নাম / Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              icon={User}
              required
            />

            <FloatingInput
              id="staff-userEmail"
              type="email"
              label="ইমেইল ঠিকানা / Email Address *"
              value={formData.userEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
              icon={Mail}
              required
            />

            <FloatingInput
              id="staff-password"
              type="password"
              label="লগইন পাসওয়ার্ড / Login Password *"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              icon={Lock}
              required
            />

            <FloatingInput
              id="staff-mobile"
              label="মোবাইল নম্বর / Phone Number (Optional)"
              value={formData.mobile}
              onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
              icon={Phone}
            />

            {/* Direct Module Permissions */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3 mt-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#005CC1]" />
                <span className="text-xs font-bold uppercase text-slate-700">
                  মডিউল অনুমতি / Module Permissions
                </span>
              </div>

              <div className="divide-y divide-slate-200/80 bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
                {MODULES.map((m) => {
                  const p = perms[m.key] || { read: false, write: false, delete: false }
                  return (
                    <div key={m.key} className="p-3 sm:p-3.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{m.label}</span>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={p.read}
                            onChange={(e) => handleTogglePerm(m.key, "read", e.target.checked)}
                          />
                          <span className="text-slate-600 font-medium text-[11px]">View</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={p.write}
                            onChange={(e) => handleTogglePerm(m.key, "write", e.target.checked)}
                          />
                          <span className="text-slate-600 font-medium text-[11px]">Create/Edit</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={p.delete}
                            onChange={(e) => handleTogglePerm(m.key, "delete", e.target.checked)}
                          />
                          <span className="text-slate-600 font-medium text-[11px]">Delete</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </PageWrapper>
  )
}
