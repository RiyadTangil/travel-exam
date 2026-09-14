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
  KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { LogoUpload } from "@/components/shared/logo-upload";

interface Company {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  businessType?: string;
  tradeLicenseNo?: string;
  tinNo?: string;
  binNo?: string;
  phone?: string;
  contactPerson?: string;
  designation?: string;
  extraInfo?: string;
  facebook?: string;
  website?: string;
  logoUrl?: string;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
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
    address2: "",
    businessType: "",
    tradeLicenseNo: "",
    tinNo: "",
    binNo: "",
    phone: "",
    contactPerson: "",
    designation: "",
    extraInfo: "",
    facebook: "",
    website: "",
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
            address2: data.company.address2 || "",
            businessType: data.company.businessType || "",
            tradeLicenseNo: data.company.tradeLicenseNo || "",
            tinNo: data.company.tinNo || "",
            binNo: data.company.binNo || "",
            phone: data.company.phone || "",
            contactPerson: data.company.contactPerson || "",
            designation: data.company.designation || "",
            extraInfo: data.company.extraInfo || "",
            facebook: data.company.facebook || "",
            website: data.company.website || "",
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
    return (
      <PageWrapper
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "আমার প্রোফাইল / Candidate Profile" },
        ]}
      >
        <div className="mx-auto max-w-4xl px-4 pb-12 space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#005CC1] via-[#0284C7] to-[#0ea5e9] p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl font-bold">
                  <GraduationCap className="h-9 w-9 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold uppercase tracking-wider">
                      পরীক্ষার্থী প্রোফাইল
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-[11px] font-semibold tracking-wider">
                      পাসপোর্ট: {candidateData.passportNumber || "অনির্ধারিত"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {candidateData.fullName || session?.user?.name || "Candidate"}
                  </h1>
                  <p className="text-xs text-blue-100">
                    সংশ্লিষ্ট এজেন্সি: {session?.user?.companyName || "Registered Agency"}
                  </p>
                </div>
              </div>
              <div className="sm:self-end">
                <Badge className="bg-white text-[#005CC1] border-none font-semibold px-3 py-1 text-xs">
                  স্ট্যাটাস: {candidateData.examStatus}
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleCandidateSave} className="space-y-6">
            {/* Identity & Exam Details Card */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#005CC1]" />
                  শিক্ষার্থীর পরিচয় ও পরীক্ষার বিবরণ / Candidate Credentials
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  নিবন্ধিত পাসপোর্ট ও পরীক্ষার ট্রেড তথ্য (পরিবর্তনযোগ্য নয়)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="cand-name" className="text-xs font-semibold text-slate-700">
                      শিক্ষার্থীর পূর্ণ নাম / Full Name *
                    </Label>
                    <Input
                      id="cand-name"
                      value={candidateData.fullName}
                      onChange={(e) => setCandidateData({ ...candidateData, fullName: e.target.value })}
                      required
                      placeholder="Enter your full name"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cand-passport" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>পাসপোর্ট নম্বর / Passport Number (Verified ID)</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </Label>
                    <Input
                      id="cand-passport"
                      value={candidateData.passportNumber}
                      disabled
                      className="rounded-xl bg-slate-100 font-mono font-semibold text-slate-700 cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400">পাসপোর্ট নম্বর সংশোধনের জন্য এজেন্সির সাথে যোগাযোগ করুন।</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cand-country" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>গন্তব্য দেশ / Target Country</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </Label>
                    <Input
                      id="cand-country"
                      value={candidateData.targetCountry || "সকল দেশ / Global"}
                      disabled
                      className="rounded-xl bg-slate-100 text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cand-trade" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>ট্রেড / দক্ষতা / Trade & Profession</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </Label>
                    <Input
                      id="cand-trade"
                      value={candidateData.trade || "সাধারণ দক্ষতা / General Trade"}
                      disabled
                      className="rounded-xl bg-slate-100 text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#005CC1]" />
                  যোগাযোগের বিবরণ / Contact Information
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  আপনার মোবাইল নম্বর ও ইমেইল ঠিকানা
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="cand-email" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>ইমেইল / Login Email</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </Label>
                    <Input
                      id="cand-email"
                      value={candidateData.email}
                      disabled
                      className="rounded-xl bg-slate-100 text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cand-mobile" className="text-xs font-semibold text-slate-700">
                      মোবাইল নম্বর / Phone Number
                    </Label>
                    <Input
                      id="cand-mobile"
                      value={candidateData.mobile}
                      onChange={(e) => setCandidateData({ ...candidateData, mobile: e.target.value })}
                      placeholder="e.g. +8801700000000"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security & Password Card */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#005CC1]" />
                  পাসওয়ার্ড পরিবর্তন / Change Login Password
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  পাসওয়ার্ড পরিবর্তন না করতে চাইলে নিচের ঘরগুলো ফাঁকা রাখুন
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="cand-pass" className="text-xs font-semibold text-slate-700">
                      নতুন পাসওয়ার্ড / New Password
                    </Label>
                    <Input
                      id="cand-pass"
                      type="password"
                      value={candidatePassword}
                      onChange={(e) => setCandidatePassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cand-confirm-pass" className="text-xs font-semibold text-slate-700">
                      নতুন পাসওয়ার্ড নিশ্চিত করুন / Confirm Password
                    </Label>
                    <Input
                      id="cand-confirm-pass"
                      type="password"
                      value={candidateConfirmPassword}
                      onChange={(e) => setCandidateConfirmPassword(e.target.value)}
                      placeholder="একই পাসওয়ার্ড পুনরায় লিখুন"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={savingCandidate}
                className="bg-[#005CC1] hover:bg-[#004ca3] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2"
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
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Configuration", href: "/dashboard/configuration/companies" },
        { label: "Company Profile" },
      ]}
    >
      <div className="mx-auto w-full  px-4 pb-12">
        {/* Header Section */}
        <Card className="mb-8 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border-gray-200 overflow-hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-500 mt-1">Manage your agency information and branding</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 border-sky-200 bg-sky-50 text-sky-700 capitalize">
              {company?.subscription?.status || "Trial"} Plan
            </Badge>
          </div>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Info */}
               <div className="space-y-6">
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                  <CardHeader className="border-b border-gray-50 bg-white">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="w-5 h-5 text-sky-600" />
                      Company Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <LogoUpload 
                      defaultUrl={formData.logoUrl}
                      onUploadSuccess={handleLogoUpload}
                      onRemove={() => handleLogoUpload("")}
                      maxSizeMB={2}
                    />
                    <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
                      Recommended: Square image (200x200px).<br />
                      Supports PNG, JPG or WebP.
                    </p>
                  </CardContent>
                </Card>

                {/* Account Summary */}
                <Card className="shadow-sm border-gray-200 bg-sky-50/50">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subscription</span>
                      <Badge variant="outline" className="bg-white text-sky-600 border-sky-200">
                        {company?.subscription?.status || "Active"}
                      </Badge>
                    </div>
                    <div className="pt-4 border-t border-sky-100 flex justify-between items-center text-xs text-gray-500">
                      <span>Last Updated</span>
                      <span>{company?.updatedAt ? formatDate(company.updatedAt) : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Right Column: Logo & Stats */}
               <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                  <CardHeader className="border-b border-gray-50 bg-white">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-sky-600" />
                      Organization Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Agency Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          required
                          disabled={!canEdit}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-gray-700">Business Type</Label>
                        <Input
                          id="businessType"
                          name="businessType"
                          placeholder="Travel Agency, Tour Operator, etc."
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber" className="text-gray-700 flex items-center gap-1">
                          <span className="text-red-500">*</span> Mobile No
                        </Label>
                        <Input
                          id="mobileNumber"
                          name="mobileNumber"
                          placeholder="+880..."
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          required
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">Phone (Landline)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradeLicenseNo" className="text-gray-700">Trade License</Label>
                        <Input
                          id="tradeLicenseNo"
                          name="tradeLicenseNo"
                          placeholder="Trade License No"
                          value={formData.tradeLicenseNo}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tinNo" className="text-gray-700">TIN Number</Label>
                        <Input
                          id="tinNo"
                          name="tinNo"
                          placeholder="TIN Number"
                          value={formData.tinNo}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="binNo" className="text-gray-700">BIN Number</Label>
                        <Input
                          id="binNo"
                          name="binNo"
                          placeholder="BIN Number"
                          value={formData.binNo}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-gray-700 flex items-center gap-1">
                          <span className="text-red-500">*</span> Address 1
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          placeholder="Primary company address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={2}
                          className="border-gray-300 focus:ring-sky-500 resize-none"
                          required
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address2" className="text-gray-700">Address 2</Label>
                        <Textarea
                          id="address2"
                          name="address2"
                          placeholder="Secondary company address (Optional)"
                          value={formData.address2}
                          onChange={handleInputChange}
                          rows={2}
                          className="border-gray-300 focus:ring-sky-500 resize-none"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200 overflow-hidden">
                  <CardHeader className="border-b border-gray-50 bg-white">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-sky-600" />
                      Extra Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-gray-700">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          placeholder="Full name of contact person"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designation" className="text-gray-700">Designation</Label>
                        <Input
                          id="designation"
                          name="designation"
                          placeholder="e.g. Managing Director, Manager"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="agency@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          required
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-700">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          placeholder="https://www.example.com"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-gray-700">Facebook</Label>
                        <Input
                          id="facebook"
                          name="facebook"
                          placeholder="Facebook page URL"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          className="py-5 border-gray-300 focus:ring-sky-500"
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="extraInfo" className="text-gray-700">Extra Info</Label>
                        <Textarea
                          id="extraInfo"
                          name="extraInfo"
                          placeholder="Additional information about your agency"
                          value={formData.extraInfo}
                          onChange={handleInputChange}
                          rows={2}
                          className="border-gray-300 focus:ring-sky-500 resize-none"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            
            </div>

            {/* Form Footer */}
            <div className="sticky bottom-6 z-10">
              <Card className="shadow-lg border-sky-100 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    {!canEdit ? (
                      <><AlertCircle className="h-4 w-4 text-amber-500" /> View-only mode</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 text-green-500" /> All changes will be saved to your organization profile</>
                    )}
                  </p>
                  {canEdit && (
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                      ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Profile Info</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
} 