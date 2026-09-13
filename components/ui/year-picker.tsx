"use client"

import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface YearPickerProps {
  value?: string | number | null
  onChange?: (year: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  startYear?: number
  endYear?: number
}

export function YearPicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  startYear,
  endYear,
}: YearPickerProps) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  // Base year for the 12-year decade view
  const selectedYearNumber = value ? parseInt(String(value), 10) : currentYear
  const initialBaseDecade = !isNaN(selectedYearNumber)
    ? Math.floor(selectedYearNumber / 12) * 12
    : Math.floor(currentYear / 12) * 12

  const [baseYear, setBaseYear] = useState<number>(initialBaseDecade)

  const years = Array.from({ length: 12 }, (_, i) => baseYear + i)

  const handleSelectYear = (year: number) => {
    onChange?.(String(year))
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.("")
  }

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background font-normal text-left transition-colors cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500",
            disabled && "cursor-not-allowed opacity-50 bg-muted/50",
            !value && "text-muted-foreground",
            value && "text-foreground font-semibold",
            className
          )}
        >
          <span className="truncate">{value ? String(value) : placeholder}</span>
          <span className="flex items-center gap-1 shrink-0 ml-1">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                className="p-0.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-full cursor-pointer transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={handleClear}
                title="Clear year"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-70" />
          </span>
        </button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent
          className="w-56 p-2 z-[1100] bg-white border border-slate-200 shadow-xl rounded-xl"
          align="start"
        >
          {/* Header with Decade Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
            <span className="text-xs font-bold text-slate-800 font-mono">
              {baseYear} – {baseYear + 11}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-slate-900"
                onClick={() => setBaseYear((prev) => prev - 12)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-slate-900"
                onClick={() => setBaseYear((prev) => prev + 12)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* 3x4 Grid of Years */}
          <div className="grid grid-cols-3 gap-1.5">
            {years.map((yr) => {
              const isSelected = String(value) === String(yr)
              const isCurrent = yr === currentYear
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleSelectYear(yr)}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded-md text-center transition-all cursor-pointer font-mono",
                    isSelected
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : isCurrent
                      ? "bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {yr}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
