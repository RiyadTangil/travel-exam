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
  Info
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
  logoUrl?: string;
  subscription: {
    status: "trial" | "active" | "expired" | "canceled";
    trialStartDate: string;
    trialEndDate: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  createdAt: string;
  updatedAt?: string;
  clientsCount?: {
    b2b: number;
    b2c: number;
    total: number;
  };
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

    if (!session || !canView) {
      console.log("Access denied. canView:", canView);
      router.push("/dashboard");
      return;
    }

    async function fetchCompanyProfile() {
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
  }, [session, status, router, canView]);

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