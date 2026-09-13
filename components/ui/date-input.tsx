"use client"

import React, { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
import { cn, parseLocalDate } from "@/lib/utils"
import { format } from "date-fns"

export interface DateInputProps {
  value?: Date | string | null
  onChange?: (date: Date | null | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  dateFormat?: string
}

export function DateInput({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  label,
  dateFormat = "dd-MM-yyyy",
}: DateInputProps) {
  const [open, setOpen] = useState(false)

  // Safely parse Date or string date value
  const parsedDate = useMemo(() => {
    return parseLocalDate(value)
  }, [value])

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.(null)
  }

  const trigger = (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm ring-offset-background font-normal text-left transition-colors cursor-pointer select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50 bg-muted/50",
            !parsedDate && "text-muted-foreground",
            parsedDate && "text-foreground",
            className
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) setOpen((prev) => !prev)
          }}
          aria-disabled={disabled}
        >
          <span className="truncate">
            {parsedDate ? format(parsedDate, dateFormat) : placeholder}
          </span>
          <span className="flex items-center gap-1.5 shrink-0 ml-2">
            {parsedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                className="p-0.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-full cursor-pointer transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={handleClear}
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0 opacity-70" />
          </span>
        </button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent
          className="w-auto p-0 z-[1100] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden"
          align="start"
        >
          <CalendarComponent
            mode="single"
            selected={parsedDate || undefined}
            defaultMonth={parsedDate || undefined}
            onSelect={(d) => {
              onChange?.(d)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      )}
    </Popover>
  )

  if (label) {
    return (
      <div className="relative w-full">
        <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[9px] font-medium text-slate-500 pointer-events-none rounded">
          {label}
        </label>
        {trigger}
      </div>
    )
  }

  return trigger
}