"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { fetcher } from "@/lib/api/fetcher"
import { ENDPOINTS } from "@/lib/api/api-endpoints"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, FileText, Plane, Upload, X, PenTool, Loader2, Image as ImageIcon } from "lucide-react"
import type { CompanyTemplateConfig, TemplateTypeOverride } from "@/components/invoice-templates/types"
import { DEFAULT_TEMPLATE_BY_TYPE } from "@/components/invoice-templates/registry"
import imageCompression from "browser-image-compression"

const INVOICE_TYPES = [
  { value: "other", label: "Other / General" },
  { value: "visa", label: "Visa Processing" },
  { value: "umrah", label: "Group / Umrah" },
  { value: "air_ticket", label: "Air Ticket" },
  { value: "non_commission", label: "Non-Commission" },
  { value: "refund", label: "Airticket & Other Refund" },
] as const

const TEMPLATES = [
  {
    id: "classic",
    label: "Classic",
    description: "General-purpose invoice. Best for Visa, Other, and Group invoices.",
    icon: FileText,
    color: "bg-sky-50 border-sky-300 text-sky-800",
    badgeColor: "bg-sky-100 text-sky-700",
    bestFor: ["other", "visa", "umrah"],
  },
  {
    id: "airline",
    label: "Airline",
    description: "Airline-style invoice with Flight/Route and Ticket/PNR table. Best for Air Ticket and Non-Commission.",
    icon: Plane,
    color: "bg-amber-50 border-amber-300 text-amber-800",
    badgeColor: "bg-amber-100 text-amber-700",
    bestFor: ["air_ticket", "non_commission"],
  },
]

export default function InvoiceTemplatesConfigPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const { data: configResponse, isLoading, refetch } = useQuery({
    queryKey: [ENDPOINTS.INVOICE_TEMPLATE_CONFIG.KEY],
    queryFn: () => fetcher<any>(ENDPOINTS.INVOICE_TEMPLATE_CONFIG.URL),
  })

  const savedConfig: CompanyTemplateConfig | null = configResponse?.data ?? null

  // All state starts with sensible defaults — populated from API via useEffect below
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>("airline")
  const [overrides, setOverrides] = useState<TemplateTypeOverride[]>([])
  const [showWatermark, setShowWatermark] = useState(true)
  const [showSignatures, setShowSignatures] = useState(true)
  const [showServiceCharge, setShowServiceCharge] = useState(true)
  const [showVat, setShowVat] = useState(true)
  const [showPayment, setShowPayment] = useState(true)
  const [showDue, setShowDue] = useState(true)
  const [showFlightDetails, setShowFlightDetails] = useState<number>(0)
  const [signatureUrl, setSignatureUrl] = useState("")
  const [signatureTitle, setSignatureTitle] = useState("Authority Signature")
  const [customHeader, setCustomHeader] = useState("")
  const [customFooter, setCustomFooter] = useState("")
  const [uploadingSig, setUploadingSig] = useState(false)
  const sigInputRef = useRef<HTMLInputElement | null>(null)

  // Sync from API whenever savedConfig is loaded or refetched
  useEffect(() => {
    if (savedConfig) {
      setDefaultTemplateId(savedConfig.defaultTemplateId ?? "airline")
      setOverrides(savedConfig.overrides ?? [])
      setShowWatermark(savedConfig.showWatermark ?? true)
      setShowSignatures(savedConfig.showSignatures ?? true)
      setShowServiceCharge(savedConfig.showServiceCharge ?? true)
      setShowVat(savedConfig.showVat ?? true)
      setShowPayment(savedConfig.showPayment ?? true)
      setShowDue(savedConfig.showDue ?? true)
      setShowFlightDetails(savedConfig.showFlightDetails ?? 0)
      setSignatureUrl(savedConfig.signatureUrl ?? "")
      setSignatureTitle(savedConfig.signatureTitle ?? "Authority Signature")
      setCustomHeader(savedConfig.customHeader ?? "")
      setCustomFooter(savedConfig.customFooter ?? "")
    }
  }, [savedConfig])

  const getTemplateForType = (invoiceType: string): string => {
    const override = overrides.find((o) => o.invoiceType === invoiceType)
    return override?.templateId ?? defaultTemplateId
  }

  const setTemplateForType = (invoiceType: string, templateId: string) => {
    setOverrides((prev) => {
      const existing = prev.findIndex((o) => o.invoiceType === invoiceType)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { invoiceType: invoiceType as any, templateId: templateId as any }
        return updated
      }
      return [...prev, { invoiceType: invoiceType as any, templateId: templateId as any }]
    })
  }

  const handleSignatureUpload = async (file: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 10MB", variant: "destructive" })
      return
    }

    setUploadingSig(true)
    try {
      // 1. Optimize & compress image before uploading
      let fileToUpload = file
      if (file.type.startsWith("image/") && !file.type.includes("svg")) {
        try {
          const compressedBlob = await imageCompression(file, {
            maxSizeMB: 0.4, // Compress down to <= 400KB
            maxWidthOrHeight: 1200, // Maximum dimensions for crisp high-DPI print
            useWebWorker: true,
            fileType: file.type.includes("png") ? "image/png" : "image/jpeg",
            initialQuality: 0.85,
          })
          fileToUpload = new File([compressedBlob], file.name, {
            type: compressedBlob.type || file.type,
          })
        } catch (compErr) {
          console.warn("Signature image compression fallback:", compErr)
        }
      }

      // 2. Get S3 Presigned URL
      const presignRes = await fetch(ENDPOINTS.UPLOAD.URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileToUpload.name, fileType: fileToUpload.type }),
      })
      const presignJson = await presignRes.json()
      if (!presignRes.ok) throw new Error(presignJson.message || "Failed to generate upload URL")

      const { presignedUrl, publicUrl } = presignJson.data

      // 3. Upload optimized file directly to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": fileToUpload.type },
        body: fileToUpload,
      })

      if (!uploadRes.ok) throw new Error("Failed to upload image to storage")

      setSignatureUrl(publicUrl)
      toast({ title: "Signature Uploaded & Optimized", description: "Remember to click 'Save Settings' to apply." })
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" })
    } finally {
      setUploadingSig(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(ENDPOINTS.INVOICE_TEMPLATE_CONFIG.URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultTemplateId,
          overrides,
          showWatermark,
          showSignatures,
          showServiceCharge,
          showVat,
          showPayment,
          showDue,
          showFlightDetails: showFlightDetails ? 1 : 0,
          signatureUrl: signatureUrl.trim() ? signatureUrl.trim() : null,
          signatureTitle: signatureTitle.trim() ? signatureTitle.trim() : "Authority Signature",
          customHeader: customHeader.trim() ? customHeader.trim() : null,
          customFooter: customFooter.trim() ? customFooter.trim() : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Save failed")

      const updatedData: CompanyTemplateConfig | null = json.data ?? null
      if (updatedData) {
        setDefaultTemplateId(updatedData.defaultTemplateId ?? "airline")
        setOverrides(updatedData.overrides ?? [])
        setShowWatermark(updatedData.showWatermark ?? true)
        setShowSignatures(updatedData.showSignatures ?? true)
        setShowServiceCharge(updatedData.showServiceCharge ?? true)
        setShowVat(updatedData.showVat ?? true)
        setShowPayment(updatedData.showPayment ?? true)
        setShowDue(updatedData.showDue ?? true)
        setShowFlightDetails(updatedData.showFlightDetails ?? 0)
        setSignatureUrl(updatedData.signatureUrl ?? "")
        setSignatureTitle(updatedData.signatureTitle ?? "Authority Signature")
        setCustomHeader(updatedData.customHeader ?? "")
        setCustomFooter(updatedData.customFooter ?? "")
      }

      toast({ title: "Saved", description: "Invoice template settings updated." })
      void refetch()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const systemDefault = (invoiceType: string) => DEFAULT_TEMPLATE_BY_TYPE[invoiceType] ?? "airline"

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Configuration", href: "/dashboard/configuration/users" },
        { label: "Invoice Templates" },
      ]}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Templates</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Choose the invoice layout for each invoice type. Set a company-wide default, then override for specific types.
          </p>
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-sm">Loading settings...</div>
        ) : (
          <>
            {/* ── Company Default ──────────────────────────────────── */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">Company Default Template</h2>
                <p className="text-xs text-gray-500 mt-0.5">Used for any invoice type that doesn&apos;t have a specific override set below.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon
                  const isSelected = defaultTemplateId === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setDefaultTemplateId(tpl.id)}
                      className={`flex flex-col gap-2 p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected ? tpl.color + " ring-2 ring-offset-1" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold">{tpl.label}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">{tpl.description}</p>
                      <div className="flex gap-1 flex-wrap">
                        {tpl.bestFor.map((t) => (
                          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tpl.badgeColor}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* ── Per-Type Overrides ───────────────────────────────── */}
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">Per Invoice Type Override</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Override the template for specific invoice types. Leave at &quot;Default&quot; to use the company default above.
                </p>
              </div>
              <div className="space-y-3">
                {INVOICE_TYPES.map(({ value, label }) => {
                  const current = getTemplateForType(value)
                  const hasOverride = overrides.some((o) => o.invoiceType === value)
                  const sysDefault = systemDefault(value)
                  return (
                    <div key={value} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">
                          System default: <span className="font-semibold capitalize">{sysDefault}</span>
                          {!hasOverride && <span className="ml-2 text-gray-400">(using company default)</span>}
                          {hasOverride && <Badge className="ml-2 text-[10px] px-1.5 py-0" variant="outline">Override active</Badge>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {TEMPLATES.map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => setTemplateForType(value, tpl.id)}
                            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                              current === tpl.id
                                ? tpl.color + " border-current"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {tpl.label}
                            {current === tpl.id && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* ── Display Options ──────────────────────────────────── */}
            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-800 text-base">Display Options</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Watermark</Label>
                  <p className="text-xs text-gray-400">Display company logo as background watermark on invoices</p>
                </div>
                <Switch checked={showWatermark} onCheckedChange={setShowWatermark} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Signature Lines</Label>
                  <p className="text-xs text-gray-400">Show Customer &amp; Authority signature lines at the bottom</p>
                </div>
                <Switch checked={showSignatures} onCheckedChange={setShowSignatures} />
              </div>

              {/* Show Payment */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Payment Amount</Label>
                  <p className="text-xs text-gray-400">Display Payment in the invoice summary</p>
                </div>
                <Switch checked={showPayment} onCheckedChange={setShowPayment} />
              </div>

              {/* Show Due */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Due Amount</Label>
                  <p className="text-xs text-gray-400">Display Due in the invoice summary</p>
                </div>
                <Switch checked={showDue} onCheckedChange={setShowDue} />
              </div>

              {/* Show Flight / Route Details */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Flight / Route Details</Label>
                  <p className="text-xs text-gray-400">Display FLIGHT/ROUTE DETAILS section on airline invoice templates (Hidden by default)</p>
                </div>
                <Switch checked={showFlightDetails === 1} onCheckedChange={(checked) => setShowFlightDetails(checked ? 1 : 0)} />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Label className="text-sm font-medium">Custom Header Text (optional)</Label>
                <Input
                  placeholder='e.g. "Copy for Client" or "Confidential"'
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Custom Footer Note (optional)</Label>
                <Textarea
                  placeholder="e.g. Thank you for your business! Payment is due within 30 days."
                  value={customFooter}
                  onChange={(e) => setCustomFooter(e.target.value)}
                  rows={2}
                />
              </div>
            </Card>

            {/* ── Digital Signature & Seal ─────────────────────────── */}
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-sky-600" />
                  Default Digital Signature &amp; Stamp / Seal
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload an official digital signature or authority seal image (transparent PNG recommended). It will automatically be placed above the authority signature line on all invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                {/* Signature Image Preview & Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Signature / Seal Image</Label>
                  <input
                    ref={sigInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleSignatureUpload(file)
                    }}
                  />

                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50 flex flex-col items-center justify-center gap-3 min-h-[120px] relative">
                    {uploadingSig ? (
                      <div className="flex flex-col items-center gap-2 text-sky-600 py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs font-medium">Uploading signature...</span>
                      </div>
                    ) : signatureUrl ? (
                      <div className="relative group flex flex-col items-center py-1">
                        <div className="bg-white border border-gray-200 rounded p-2 shadow-sm max-w-[200px] h-[70px] flex items-center justify-center">
                          <img
                            src={signatureUrl}
                            alt="Digital Signature Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => sigInputRef.current?.click()}
                            className="text-xs h-7"
                          >
                            Change Image
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSignatureUrl("")}
                            className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => sigInputRef.current?.click()}
                        className="cursor-pointer flex flex-col items-center text-center p-3 text-gray-500 hover:text-sky-600 transition-colors w-full"
                      >
                        <Upload className="h-6 w-6 mb-1 text-gray-400" />
                        <p className="text-xs font-medium">Click to upload signature image</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG (transparent), JPG, WebP up to 3MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature Title & URL Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Signature Line Title</Label>
                    <Input
                      placeholder='e.g. "Authority Signature", "Managing Director", "Authorized Signatory"'
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                    />
                    <p className="text-[11px] text-gray-400">
                      The label displayed underneath the signature line on invoices.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or Direct Image URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={signatureUrl}
                      onChange={(e) => setSignatureUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Save ──────────────────────────────────────────────── */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
