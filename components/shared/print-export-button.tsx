"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Printer,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Search,
  Check,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { renderToString } from "react-dom/server"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export interface PrintColumn<T> {
  header: string
  key: keyof T | ((item: T, index: number) => React.ReactNode)
  color?: (item: T) => string
  defaultHidden?: boolean
}

interface PrintExportButtonProps<T> {
  data: T[]
  reportTitle?: string
  columns: PrintColumn<T>[]
  storageKey?: string
  defaultOrientation?: "landscape" | "portrait"
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
}

interface SavedPrintConfig {
  orientation: "landscape" | "portrait"
  hiddenCols: string[]
  hasCustomized?: boolean
}

export function PrintExportButton<T>({
  data,
  reportTitle = "Report",
  columns,
  storageKey,
  defaultOrientation = "landscape",
  variant = "default",
  className,
}: PrintExportButtonProps<T>) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPrinting, setIsPrinting] = React.useState(false)
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">(defaultOrientation)
  const [selectedHeaders, setSelectedHeaders] = React.useState<string[]>([])
  const [hasSavedConfig, setHasSavedConfig] = React.useState(false)
  const [columnSearch, setColumnSearch] = React.useState("")

  const configKey = storageKey ? `print_cfg_${storageKey}` : null

  // Initialize selected columns & orientation from localStorage or defaults
  React.useEffect(() => {
    let initialOrientation = defaultOrientation
    let initialSelected = columns.filter((c) => !c.defaultHidden).map((c) => c.header)
    let foundSaved = false

    if (configKey) {
      try {
        const raw = localStorage.getItem(configKey)
        if (raw) {
          const parsed: SavedPrintConfig = JSON.parse(raw)
          if (parsed.orientation === "landscape" || parsed.orientation === "portrait") {
            initialOrientation = parsed.orientation
          }
          if (Array.isArray(parsed.hiddenCols)) {
            const hiddenSet = new Set(parsed.hiddenCols)
            initialSelected = columns
              .filter((c) => !hiddenSet.has(c.header))
              .map((c) => c.header)
            foundSaved = true
          }
        }
      } catch {
        // Fallback to default
      }
    }

    setOrientation(initialOrientation)
    setSelectedHeaders(initialSelected)
    setHasSavedConfig(foundSaved)
  }, [configKey, defaultOrientation, columns])

  // Save changes to localStorage (stores minimal payload: { orientation, hiddenCols, hasCustomized: true })
  const saveConfig = (newOrientation: "landscape" | "portrait", currentSelected: string[]) => {
    if (!configKey) return
    try {
      const selectedSet = new Set(currentSelected)
      const hiddenCols = columns
        .filter((c) => !selectedSet.has(c.header))
        .map((c) => c.header)
      const config: SavedPrintConfig = { orientation: newOrientation, hiddenCols, hasCustomized: true }
      localStorage.setItem(configKey, JSON.stringify(config))
      setHasSavedConfig(true)
    } catch {
      // Ignore localStorage errors
    }
  }

  const toggleColumn = (header: string) => {
    setSelectedHeaders((prev) => {
      const next = prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header]
      saveConfig(orientation, next)
      return next
    })
  }

  const handleSelectAll = () => {
    const all = columns.map((c) => c.header)
    setSelectedHeaders(all)
    saveConfig(orientation, all)
  }

  const handleDeselectAll = () => {
    setSelectedHeaders([])
    saveConfig(orientation, [])
  }

  const handleResetDefaults = () => {
    const def = columns.filter((c) => !c.defaultHidden).map((c) => c.header)
    setSelectedHeaders(def)
    setOrientation(defaultOrientation)
    if (configKey) {
      try {
        localStorage.removeItem(configKey)
      } catch {}
    }
    setHasSavedConfig(false)
    toast({ title: "Reset Complete", description: "Print settings returned to default." })
  }

  const handleOrientationChange = (val: "landscape" | "portrait") => {
    setOrientation(val)
    saveConfig(val, selectedHeaders)
  }

  // Smart Presets
  const applyFinancialPreset = () => {
    const financialKeywords = ["sl", "date", "particulars", "voucher", "pay", "debit", "credit", "balance", "total"]
    const matched = columns
      .filter((c) => {
        const lower = c.header.toLowerCase()
        return financialKeywords.some((kw) => lower.includes(kw))
      })
      .map((c) => c.header)
    setSelectedHeaders(matched)
    setOrientation("portrait")
    saveConfig("portrait", matched)
    toast({ title: "Preset Applied", description: "Financial Summary preset loaded (Portrait)." })
  }

  const applyTravelPreset = () => {
    const travelKeywords = ["sl", "date", "particulars", "voucher", "pax", "pnr", "ticket", "route", "journey", "return", "balance"]
    const matched = columns
      .filter((c) => {
        const lower = c.header.toLowerCase()
        return travelKeywords.some((kw) => lower.includes(kw))
      })
      .map((c) => c.header)
    setSelectedHeaders(matched)
    setOrientation("landscape")
    saveConfig("landscape", matched)
    toast({ title: "Preset Applied", description: "Travel Details preset loaded (Landscape)." })
  }

  const { data: company } = useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      const res = await fetch("/api/companies/profile")
      if (!res.ok) throw new Error("Failed to fetch company profile")
      const data = await res.json()
      return data.company
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  })

  const executePrintJob = async (activeOrientation: "landscape" | "portrait", activeHeaders: string[]) => {
    const activeColumns = columns.filter((c) => activeHeaders.includes(c.header))
    if (activeColumns.length === 0) {
      toast({ title: "No Columns Selected", description: "Please select at least 1 column to print.", variant: "destructive" })
      return
    }

    setIsPrinting(true)
    setIsOpen(false)

    const originalTitle = document.title
    if (reportTitle) {
      document.title = reportTitle
    }

    const restoreTitle = () => {
      document.title = originalTitle
    }

    const qrValue = company
      ? `Name: ${company.name || ""}\nEmail: ${company.email || ""}\nPhone: ${
          company.mobileNumber || company.phone || ""
        }\nAddress: ${company.address || ""}`
      : `Report: ${reportTitle}\nDate: ${new Date().toLocaleDateString()}`
    const qrSvg = renderToString(<QRCodeSVG value={qrValue} size={65} />)

    const headerHtml = company
      ? `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div style="width: 50mm;">
          ${
            company.logoUrl
              ? `<img id="company-logo" src="${company.logoUrl}" alt="Company Logo" style="max-height: 22mm; object-fit: contain;" />`
              : `<div style="font-size: 24px; font-weight: bold; color: #dc2626;">${company.name}</div>`
          }
        </div>
        <div style="display: flex; align-items: flex-start; gap: 16px; font-size: 10px;">
          <div style="padding: 4px; background: white; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
            ${qrSvg}
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; max-width: 80mm; text-align: right;">
            <h2 style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">${company.name || ""}</h2>
            <p style="margin: 0; color: #4b5563; font-weight: 600;">Address: ${company.address || ""}</p>
            ${company.address2 ? `<p style="margin: 0; color: #4b5563;">${company.address2}</p>` : ""}
            <p style="margin: 0; color: #4b5563;">Mobile: ${company.mobileNumber || ""} ${
          company.phone ? `, ${company.phone}` : ""
        }</p>
            <p style="margin: 0; color: #4b5563;">Email: ${company.email || ""}</p>
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <div style="border: 1.5px solid #075985; border-radius: 6px; padding: 4px 20px; color: #075985; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px; background-color: white;">
              ${reportTitle}
          </div>
      </div>
    `
      : `<h2 style="text-align: center; margin-bottom: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">${reportTitle}</h2>`

    let html = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @page { size: A4 ${activeOrientation}; margin: 4mm 3mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 4mm; position: relative; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: auto; }
            th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; font-size: 9.5px; line-height: 1.25; }
            th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; white-space: nowrap; }
            tr:nth-child(even) { background-color: #f8fafc; }
            td.number { text-align: right; white-space: nowrap; }
            .nowrap { white-space: nowrap; }
            .print-footer { text-align: center; font-size: 8.5px; color: #64748b; margin-top: 15px; }
            .watermark { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.03; pointer-events: none; z-index: -1; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">
            ${
              company?.logoUrl
                ? `<img src="${company.logoUrl}" style="width: 500px; height: 500px; max-width: 80%; max-height: 80%; object-fit: contain;" />`
                : ""
            }
          </div>
          ${headerHtml}
          <table>
            <thead>
              <tr>
                ${activeColumns.map((c) => `<th>${c.header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
    `

    data.forEach((item, i) => {
      html += "<tr>"
      activeColumns.forEach((col) => {
        let cellValue = ""
        if (typeof col.key === "function") {
          const val = col.key(item, i)
          cellValue = val !== null && val !== undefined ? String(val) : ""
        } else {
          const val = item[col.key as keyof T]
          cellValue = val !== null && val !== undefined ? String(val) : ""
        }

        const isNum =
          (!isNaN(Number(cellValue)) && cellValue.trim() !== "" && cellValue !== "0") ||
          cellValue === "0"

        let styleStr = ""
        if (col.color) {
          const colorVal = col.color(item)
          if (colorVal) styleStr = ` style="color: ${colorVal}; font-weight: 500;"`
        }

        html += `<td${isNum ? ' class="number"' : ""}${styleStr}>${cellValue}</td>`
      })
      html += "</tr>"
    })

    html += `
            </tbody>
          </table>
          <div class="print-footer">
            Generated on ${new Date().toLocaleString()}
          </div>
          <script>
            var printed = false;
            function doPrint() {
              if (printed) return;
              printed = true;
              window.focus();
              window.print();
            }

            window.onafterprint = function() {
              window.parent.postMessage('printDone', '*');
            };

            var img = document.getElementById('company-logo');
            if (img) {
              if (img.complete) {
                setTimeout(doPrint, 100);
              } else {
                img.onload = function() { setTimeout(doPrint, 100); };
                img.onerror = function() { setTimeout(doPrint, 100); };
              }
            } else {
              setTimeout(doPrint, 100);
            }

            // Fallback safety timeout if something hangs
            setTimeout(doPrint, 3000);
          </script>
        </body>
      </html>
    `

    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.width = "0"
    printFrame.style.height = "0"
    printFrame.style.border = "none"

    document.body.appendChild(printFrame)

    const handleMessage = (event: MessageEvent) => {
      if (event.data === "printDone") {
        window.removeEventListener("message", handleMessage)
        restoreTitle()
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame)
          }
          setIsPrinting(false)
        }, 500)
      }
    }
    window.addEventListener("message", handleMessage)

    const frameDoc = printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(html)
      frameDoc.close()

      setTimeout(() => {
        window.removeEventListener("message", handleMessage)
        restoreTitle()
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame)
        }
        setIsPrinting(false)
      }, 10000)
    } else {
      restoreTitle()
      setIsPrinting(false)
    }
  }

  // Smart 1-click print button handler:
  // If user has saved preferences, print directly with instant feedback!
  // If first time, open the customize dialog.
  const handlePrimaryClick = () => {
    if (hasSavedConfig) {
      toast({
        title: "Printing with Saved Preferences",
        description: `${orientation.toUpperCase()} • ${selectedHeaders.length} columns. Use ⚙️ dropdown to modify.`,
      })
      void executePrintJob(orientation, selectedHeaders)
    } else {
      setIsOpen(true)
    }
  }

  const filteredColumns = React.useMemo(() => {
    if (!columnSearch.trim()) return columns
    const q = columnSearch.toLowerCase().trim()
    return columns.filter((c) => c.header.toLowerCase().includes(q))
  }, [columns, columnSearch])

  const selectedCount = selectedHeaders.length
  const totalCount = columns.length

  return (
    <>
      <div className="inline-flex items-center rounded-md shadow-2xs">
        {/* Main 1-Click Print Button */}
        <Button
          variant={variant}
          className={`${className ?? ""} rounded-r-none border-r-0`}
          onClick={handlePrimaryClick}
          disabled={!data || data.length === 0 || isPrinting}
          title={
            hasSavedConfig
              ? `Quick Print (${orientation} • ${selectedCount} cols). Click arrow to customize.`
              : "Customize & Print Report"
          }
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Preparing..." : "Print"}
          {hasSavedConfig && (
            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </Button>

        {/* Dropdown / Settings Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              className="px-2 rounded-l-none border-l border-white/20"
              disabled={!data || data.length === 0 || isPrinting}
              title="Print Options & Layout Settings"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {hasSavedConfig ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved: <span className="capitalize">{orientation}</span> ({selectedCount}/{totalCount} cols)
                </div>
              ) : (
                <span>Default: All {totalCount} columns</span>
              )}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void executePrintJob(orientation, selectedHeaders)} className="gap-2 text-xs">
              <Printer className="w-3.5 h-3.5 text-sky-600" />
              <span>Quick Print (Active Settings)</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setIsOpen(true)} className="gap-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Customize Layout & Columns...</span>
            </DropdownMenuItem>

            {hasSavedConfig && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetDefaults} className="gap-2 text-xs text-red-600 hover:text-red-700">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to System Defaults</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Customizer Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[580px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-sky-600" />
                Customize Print Layout
              </span>
              {hasSavedConfig && (
                <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-300 bg-emerald-50 font-normal">
                  <Check className="w-3 h-3 mr-1" /> Saved Layout
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Select columns and orientation. Your preferences are saved automatically for 1-click printing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick Smart Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Presets
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs h-7 gap-1"
                >
                  Full Report (All Columns)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyFinancialPreset}
                  className="text-xs h-7 gap-1"
                >
                  Financial Summary (Portrait)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyTravelPreset}
                  className="text-xs h-7 gap-1"
                >
                  Travel & Pax Details (Landscape)
                </Button>
              </div>
            </div>

            {/* Orientation Selection */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Page Orientation
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleOrientationChange("landscape")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    orientation === "landscape"
                      ? "border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-500/20"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-6 h-4 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">
                    L
                  </div>
                  <span>Landscape (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOrientationChange("portrait")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    orientation === "portrait"
                      ? "border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-500/20"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-4 h-6 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">
                    P
                  </div>
                  <span>Portrait (A4)</span>
                </button>
              </div>
            </div>

            {/* Column Picker with Search */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Columns to Print
                  </Label>
                  <Badge variant="secondary" className="text-[11px] px-1.5 py-0 font-normal">
                    {selectedCount} of {totalCount} Selected
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {columns.length > 8 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search columns..."
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 max-h-[220px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {filteredColumns.map((col) => {
                    const checked = selectedHeaders.includes(col.header)
                    return (
                      <label
                        key={col.header}
                        className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                          checked
                            ? "bg-white border-sky-300 text-gray-900 shadow-2xs"
                            : "bg-white/50 border-gray-200 text-gray-400 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColumn(col.header)}
                          className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                        />
                        <span className="truncate font-medium">{col.header}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs text-gray-500 hover:text-red-600 gap-1 mr-auto"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void executePrintJob(orientation, selectedHeaders)}
                disabled={selectedCount === 0 || isPrinting}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? "Preparing..." : "Print & Save Layout"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


