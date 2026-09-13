"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { addYears, format, setMonth, setYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/**
 * Compact, Short & Scrollable Year Dropdown with working mouse wheel & auto-load
 */
function CompactYearSelect({
  currentYear,
  onSelectYear,
}: {
  currentYear: number
  onSelectYear: (year: number) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [minYear, setMinYear] = React.useState(currentYear - 20)
  const [maxYear, setMaxYear] = React.useState(currentYear + 20)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const selectedRef = React.useRef<HTMLButtonElement>(null)

  // Reset range if currentYear moves outside
  React.useEffect(() => {
    if (currentYear < minYear || currentYear > maxYear) {
      setMinYear(currentYear - 20)
      setMaxYear(currentYear + 20)
    }
  }, [currentYear, minYear, maxYear])

  const years = React.useMemo(() => {
    const arr: number[] = []
    for (let y = minYear; y <= maxYear; y++) {
      arr.push(y)
    }
    return arr
  }, [minYear, maxYear])

  // Center active year in the short scrollable view
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: "center", behavior: "auto" })
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [isOpen])

  // Auto load more years on wheel / scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const target = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target

    // Near bottom -> load 15 more future years
    if (scrollHeight - scrollTop - clientHeight < 25) {
      setMaxYear((prev) => prev + 15)
    }

    // Near top -> load 15 more past years
    if (scrollTop < 25 && minYear > 1900) {
      const prevScrollHeight = scrollHeight
      setMinYear((prev) => Math.max(1900, prev - 15))
      requestAnimationFrame(() => {
        if (target) {
          const newScrollHeight = target.scrollHeight
          target.scrollTop = scrollTop + (newScrollHeight - prevScrollHeight)
        }
      })
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center justify-between w-[52px] h-6.5 px-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors select-none",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <span>{currentYear}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-[1300] w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={(e) => e.stopPropagation()}
            className="h-52 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:thin] overscroll-contain"
          >
            {years.map((y) => {
              const isSelected = y === currentYear
              return (
                <button
                  key={y}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => {
                    onSelectYear(y)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-center py-1.5 text-xs rounded transition-colors block font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {y}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Month Dropdown Grid
 */
function CompactMonthSelect({
  currentMonthIdx,
  onSelectMonth,
}: {
  currentMonthIdx: number
  onSelectMonth: (monthIdx: number) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center justify-between w-[74px] h-6.5 px-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors select-none",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <span className="truncate">{MONTHS_FULL[currentMonthIdx]}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-[1300] w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg p-2 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, idx) => {
              const isSelected = idx === currentMonthIdx
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onSelectMonth(idx)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "py-2 text-xs rounded text-center transition-colors font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center gap-1",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6.5 w-6.5 bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-1.5",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
        day_today: "bg-accent text-accent-foreground font-semibold",
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-3.5 w-3.5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-3.5 w-3.5" />,
        Caption: (props) => {
          const { goToMonth, nextMonth, previousMonth } = useNavigation()
          const displayMonth = props.displayMonth
          const currentMonthIdx = displayMonth.getMonth()
          const currentYear = displayMonth.getFullYear()

          return (
            <div className="relative flex justify-center items-center h-7.5 px-0.5 mb-1">
              {/* Previous Year & Month Buttons */}
              <div className="absolute left-0.5 flex items-center gap-0.5 z-10">
                <button
                  type="button"
                  title="Previous Year"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-6.5 w-6.5 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
                  )}
                  onClick={() => goToMonth(addYears(displayMonth, -1))}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Previous Month"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-6.5 w-6.5 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
                  )}
                  onClick={() => previousMonth && goToMonth(previousMonth)}
                  disabled={!previousMonth}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Compact Fixed-Width Month & Year Selectors */}
              <div className="flex items-center gap-1">
                <CompactMonthSelect
                  currentMonthIdx={currentMonthIdx}
                  onSelectMonth={(idx) => {
                    goToMonth(setMonth(displayMonth, idx))
                  }}
                />

                <CompactYearSelect
                  currentYear={currentYear}
                  onSelectYear={(year) => {
                    goToMonth(setYear(displayMonth, year))
                  }}
                />
              </div>

              {/* Next Month & Year Buttons */}
              <div className="absolute right-0.5 flex items-center gap-0.5 z-10">
                <button
                  type="button"
                  title="Next Month"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-6.5 w-6.5 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
                  )}
                  onClick={() => nextMonth && goToMonth(nextMonth)}
                  disabled={!nextMonth}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Next Year"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-6.5 w-6.5 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
                  )}
                  onClick={() => goToMonth(addYears(displayMonth, 1))}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
