"use client"

import * as React from "react"
import { addDays, format, subDays, startOfDay, endOfDay, subMonths, parse } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type StringDateRange = {
  from?: string
  to?: string
}

interface DateRangePickerProps {
  date?: StringDateRange
  onDateChange?: (date?: StringDateRange) => void
  className?: string
  placeholder?: string
}

export function DateRangePickerWithPresets({
  date,
  onDateChange,
  className,
  placeholder = "Start date -> End date",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Convert string date range to Date object date range
  const dateObjRange = React.useMemo<StringDateRange | undefined>(() => {
    if (!date) return undefined
    return {
      from: date.from ? parse(date.from, "yyyy-MM-dd", new Date()) : undefined,
      to: date.to ? parse(date.to, "yyyy-MM-dd", new Date()) : undefined,
    }
  }, [date])

  const handleSelect = (range: StringDateRange | undefined) => {
    if (!range) {
      onDateChange?.(undefined)
      return
    }
    onDateChange?.({
      from: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
      to: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
    })
  }

  // Presets
  const presets = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date()
        return { 
          from: format(today, "yyyy-MM-dd"), 
          to: format(today, "yyyy-MM-dd") 
        }
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = subDays(new Date(), 1)
        return { 
          from: format(yesterday, "yyyy-MM-dd"), 
          to: format(yesterday, "yyyy-MM-dd") 
        }
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const today = new Date()
        return { 
          from: format(subDays(today, 7), "yyyy-MM-dd"), 
          to: format(today, "yyyy-MM-dd") 
        }
      },
    },
    {
      label: "Last 14 Days",
      getValue: () => {
        const today = new Date()
        return { 
          from: format(subDays(today, 14), "yyyy-MM-dd"), 
          to: format(today, "yyyy-MM-dd") 
        }
      },
    },
    {
      label: "Last 30 Days",
      getValue: () => {
        const today = new Date()
        return { 
          from: format(subDays(today, 30), "yyyy-MM-dd"), 
          to: format(today, "yyyy-MM-dd") 
        }
      },
    },
    {
      label: "Last 90 Days",
      getValue: () => {
        const today = new Date()
        return { 
          from: format(subDays(today, 90), "yyyy-MM-dd"), 
          to: format(today, "yyyy-MM-dd") 
        }
      },
    },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-between text-left font-normal",
              !dateObjRange && "text-muted-foreground"
            )}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateObjRange?.from ? (
                dateObjRange.to ? (
                  <>
                    {format(dateObjRange.from, "LLL dd, y")} -{" "}
                    {format(dateObjRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateObjRange.from, "LLL dd, y")
                )
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            {dateObjRange?.from && (
               <div 
                 role="button"
                 className="hover:bg-gray-200 p-1 rounded-full"
                 onClick={(e) => {
                   e.stopPropagation()
                   onDateChange?.(undefined)
                 }}
               >
                 <X className="h-4 w-4 text-gray-500" />
               </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="flex flex-col gap-2 p-3 border-r">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="justify-start font-normal text-sm h-8"
                  onClick={() => {
                    onDateChange?.(preset.getValue())
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateObjRange?.from}
                selected={dateObjRange}
                onSelect={handleSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
