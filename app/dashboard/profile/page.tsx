"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Building, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Save, 
  Upload, 
  Mail, 
  Phone, 
  MapPin,
  Building2,
  Users,
  CreditCard,
  Plane,
  Facebook,
  Globe,
  FileText,
  Info,
  GraduationCap,
  User,
  Lock,
  Shield,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { LogoUpload } from "@/components/shared/logo-upload";
import { cn } from "@/lib/utils";

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

interface Company {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  logoUrl?: string;
  subscription?: {
    plan?: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
  clientsCount?: {
    b2b: number;
    b2c: number;
    total: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function CompanyProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const isCandidate = (session?.user as any)?.role === "CANDIDATE";

  // Candidate Profile State
  const [candidateData, setCandidateData] = useState({
    fullName: "",
    passportNumber: "",
    targetCountry: "",
    trade: "",
    email: "",
    mobile: "",
    examStatus: "PENDING",
  });
  const [candidatePassword, setCandidatePassword] = useState("");
  const [candidateConfirmPassword, setCandidateConfirmPassword] = useState("");
  const [savingCandidate, setSavingCandidate] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    address: "",
    logoUrl: "",
  });

  const { canView, canEdit } = usePermissions("/dashboard/profile");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    if (isCandidate) {
      const fetchCandidateProfile = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/candidates/${session?.user?.id}`);
          const json = await res.json();
          if (json.data) {
            setCandidateData({
              fullName: json.data.fullName || session?.user?.name || "",
              passportNumber: json.data.passportNumber || (session?.user as any).passportNumber || "",
              targetCountry: json.data.targetCountry || (session?.user as any).targetCountry || "",
              trade: json.data.trade || (session?.user as any).trade || "",
              email: json.data.userEmail || session?.user?.email || "",
              mobile: json.data.mobile || "",
              examStatus: json.data.examStatus || (session?.user as any).examStatus || "PENDING",
            });
          } else {
            setCandidateData({
              fullName: session?.user?.name || "",
              passportNumber: (session?.user as any).passportNumber || "",
              targetCountry: (session?.user as any).targetCountry || "",
              trade: (session?.user as any).trade || "",
              email: session?.user?.email || "",
              mobile: (session?.user as any).mobile || "",
              examStatus: (session?.user as any).examStatus || "PENDING",
            });
          }
        } catch (e) {
          console.error("Error loading candidate profile:", e);
        } finally {
          setLoading(false);
        }
      };
      fetchCandidateProfile();
      return;
    }

    if (!canView) {
      router.replace("/dashboard");
      return;
    }

    const fetchCompanyProfile = async () => {
      try {
        const response = await fetch("/api/companies/profile");
        const data = await response.json();
        
        if (data.company) {
          setCompany(data.company);
          setFormData({
            name: data.company.name || "",
            email: data.company.email || "",
            mobileNumber: data.company.mobileNumber || "",
            address: data.company.address || "",
            logoUrl: data.company.logoUrl || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load company profile. Please try again later.");
        toast.error("Failed to load company profile");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyProfile();
  }, [session, status, router, canView, isCandidate]);

  const handleCandidateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidatePassword && candidatePassword !== candidateConfirmPassword) {
      toast.error("পাসওয়ার্ড দুটি মিলছে না / Passwords do not match");
      return;
    }
    if (candidatePassword && candidatePassword.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে / Password must be at least 6 characters");
      return;
    }

    setSavingCandidate(true);
    try {
      const payload: any = {
        fullName: candidateData.fullName,
        mobile: candidateData.mobile,
      };
      if (candidatePassword) {
        payload.password = candidatePassword;
      }

      const res = await fetch(`/api/candidates/${session?.user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে / Profile updated successfully!");
      setCandidatePassword("");
      setCandidateConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingCandidate(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    setSaving(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch("/api/companies/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUpdateSuccess(true);
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["companyProfile"] });
        // Update local company state
        const data = await response.json();
        
        let newName = formData.name;
        let newLogoUrl = formData.logoUrl;

        if (data.updated) {
           setCompany(prev => prev ? { ...prev, ...data.updated } : null);
           if (data.updated.name) newName = data.updated.name;
           if (data.updated.logoUrl !== undefined) newLogoUrl = data.updated.logoUrl;
        } else if (company) {
          setCompany({
            ...company,
            ...formData,
            updatedAt: new Date().toISOString(),
          });
        }

        // Update NextAuth session so the header reflects the new logo/name immediately
        await update({
          ...session,
          user: {
            ...session?.user,
            companyName: newName,
            companyLogoUrl: newLogoUrl
          }
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
        toast.error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update company profile. Please try again.");
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Loading your company profile...</p>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="container max-w-5xl mx-auto py-10">
        <Card className="border-red-200 shadow-lg">
          <CardContent className="pt-10">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Agency Profile Not Found</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
              <Button onClick={() => router.push("/dashboard")} size="lg">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCandidate) {
    const getInitials = (name: string) =>
      name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "ST";

    return (
      <PageWrapper
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "আমার প্রোফাইল / Candidate Profile" },
        ]}
      >
        <div className="mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
          {/* Unified Compact Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden">
            
            {/* Sleek Top Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-6 sm:p-8 lg:p-9 text-white">
              {/* Background Glows */}
              <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 sm:h-18 sm:w-18 lg:h-20 lg:w-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl sm:text-2xl lg:text-3xl shrink-0 shadow-inner">
                    {getInitials(candidateData.fullName || session?.user?.name || "")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                        পরীক্ষার্থী / Candidate
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] sm:text-[11px] font-mono font-bold tracking-wider">
                        পাসপোর্ট: {candidateData.passportNumber || "—"}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight truncate text-white">
                      {candidateData.fullName || session?.user?.name || "Student Candidate"}
                    </h1>
                    <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1.5 mt-0.5 truncate">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                      <span>{session?.user?.companyName || "Registered Agency"}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 self-end sm:self-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-[#005CC1] font-bold text-xs sm:text-sm shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{candidateData.examStatus || "PENDING"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form with Floating Labels */}
            <form onSubmit={handleCandidateSave} className="p-6 sm:p-8 lg:p-9 space-y-6 sm:space-y-7">
              
              {/* Profile Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-[#005CC1]" />
                  শিক্ষার্থীর তথ্য / Profile Information
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Click field to edit</span>
              </div>

              {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                <FloatingInput
                  id="cand-name"
                  label="শিক্ষার্থীর নাম / Full Name *"
                  value={candidateData.fullName}
                  onChange={(e) => setCandidateData({ ...candidateData, fullName: e.target.value })}
                  required
                />

                <FloatingInput
                  id="cand-mobile"
                  label="মোবাইল নম্বর / Phone Number"
                  value={candidateData.mobile}
                  onChange={(e) => setCandidateData({ ...candidateData, mobile: e.target.value })}
                  icon={Phone}
                />

                <FloatingInput
                  id="cand-passport"
                  label="পাসপোর্ট নম্বর / Passport (Verified ID)"
                  value={candidateData.passportNumber}
                  disabled
                  icon={Lock}
                />

                <FloatingInput
                  id="cand-email"
                  label="ইমেইল / Login Email"
                  value={candidateData.email}
                  disabled
                  icon={Mail}
                />

                <FloatingInput
                  id="cand-country"
                  label="গন্তব্য দেশ / Target Country"
                  value={candidateData.targetCountry || "সকল দেশ / Global"}
                  disabled
                  icon={Globe}
                />

                <FloatingInput
                  id="cand-trade"
                  label="ট্রেড ও পেশা / Trade & Profession"
                  value={candidateData.trade || "সাধারণ ট্রেড / General Trade"}
                  disabled
                  icon={Shield}
                />
              </div>

              {/* Password Section */}
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#005CC1]" />
                    পাসওয়ার্ড পরিবর্তন / Change Password
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">ঐচ্ছিক / Optional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 max-w-2xl">
                  <FloatingInput
                    id="cand-pass"
                    type="password"
                    label="নতুন পাসওয়ার্ড / New Password"
                    value={candidatePassword}
                    onChange={(e) => setCandidatePassword(e.target.value)}
                  />

                  <FloatingInput
                    id="cand-confirm-pass"
                    type="password"
                    label="কনফার্ম পাসওয়ার্ড / Confirm Password"
                    value={candidateConfirmPassword}
                    onChange={(e) => setCandidateConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  লক করা তথ্য পরিবর্তন করতে এজেন্সির সাথে যোগাযোগ করুন
                </p>
                <Button
                  type="submit"
                  disabled={savingCandidate}
                  className="w-full sm:w-auto bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-sm"
                >
                  {savingCandidate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      পরিবর্তন সংরক্ষণ করুন / Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const getCompanyInitials = (name: string) =>
    name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "AG";

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "আমার এজেন্সি / Agency Profile" },
      ]}
    >
      <div className="mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {/* Unified Compact Company Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden">
          
          {/* Sleek Top Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-6 sm:p-8 lg:p-9 text-white">
            {/* Background Glows */}
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 sm:h-18 sm:w-18 lg:h-20 lg:w-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl sm:text-2xl lg:text-3xl shrink-0 shadow-inner overflow-hidden">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt={formData.name} className="h-full w-full object-cover" />
                  ) : (
                    getCompanyInitials(formData.name || "Agency")
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                      এজেন্সি প্রোফাইল / Agency
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] sm:text-[11px] font-bold tracking-wider">
                      {company?.subscription?.status || "Active"}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight truncate text-white">
                    {formData.name || "My Agency"}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                    <span>{formData.email || "No email provided"}</span>
                  </p>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="shrink-0 self-end sm:self-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-[#005CC1] font-bold text-xs sm:text-sm shadow-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Verified Agency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-9 space-y-6 sm:space-y-7">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
              {/* Logo Card Section */}
              <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/70 border border-slate-100/90 text-center">
                <LogoUpload
                  defaultUrl={formData.logoUrl}
                  onUploadSuccess={handleLogoUpload}
                  onRemove={() => handleLogoUpload("")}
                  maxSizeMB={2}
                />
                <p className="text-xs font-bold text-slate-700 mt-3">
                  এজেন্সির লোগো / Agency Logo
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  ছবিতে ক্লিক করে পরিবর্তন করুন
                </p>
                <span className="mt-3 px-2.5 py-1 rounded-full bg-blue-50 text-[#005CC1] text-[10px] font-semibold border border-blue-100">
                  JPG, PNG • সর্বোচ্চ 2MB
                </span>
              </div>

              {/* Essential Fields */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#005CC1]" />
                    এজেন্সির মৌলিক তথ্য / Agency Information
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Click field to edit</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  <FloatingInput
                    id="name"
                    label="এজেন্সির নাম / Agency Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={!canEdit}
                  />

                  <FloatingInput
                    id="mobileNumber"
                    label="মোবাইল নম্বর / Phone Number *"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    icon={Phone}
                    required
                    disabled={!canEdit}
                  />

                  <FloatingInput
                    id="email"
                    type="email"
                    label="অফিসিয়াল ইমেইল / Official Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    required
                    disabled={!canEdit}
                  />

                  <FloatingInput
                    id="address"
                    label="অফিস ঠিকানা / Office Address *"
                    value={formData.address}
                    onChange={handleInputChange}
                    icon={MapPin}
                    required
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                {!canEdit ? "কেবলমাত্র দেখার অনুমতি রয়েছে" : "সকল পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে"}
              </p>

              {canEdit && (
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      পরিবর্তন সংরক্ষণ করুন / Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
} 