"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { SearchInput } from "@/components/shared/search-input"
import { DateRangePickerWithPresets, StringDateRange } from "@/components/shared/date-range-with-presets"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import React from "react"

export type FilterToolbarProps = {
  className?: string
  children?: React.ReactNode
  /** Search box */
  showSearch?: boolean
  search?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  /** Date range */
  showDateRange?: boolean
  dateRange?: StringDateRange | undefined
  onDateRangeChange?: (range: StringDateRange | undefined) => void
  /** Refresh */
  showRefresh?: boolean
  onRefresh?: () => void
  /** Extra controls rendered BEFORE the date range (right side) */
  filterExtrasBefore?: React.ReactNode
  /** Extra controls rendered AFTER the search (right side, before refresh) */
  filterExtras?: React.ReactNode
  /** Override the module prefix for permissions */
  permissionPrefix?: string
  /** Keep single horizontal row and scroll on all screen widths */
  scrollable?: boolean
}

export default function FilterToolbar({
  children,
  className,
  showSearch = false,
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  showRefresh = true,
  onRefresh,
  filterExtrasBefore,
  filterExtras,
  permissionPrefix,
  scrollable = false,
}: FilterToolbarProps) {
  const { canCreate } = usePermissions(permissionPrefix)

  const renderChildrenWithPermissions = () => {
    if (children == null || children === false) return null
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          disabled: (child.props as any).disabled || !canCreate,
        } as any)
      }
      return child
    })
  }

  const hasAny =
    (showDateRange && onDateRangeChange) ||
    (showSearch && onSearchChange) ||
    (showRefresh && onRefresh) ||
    !!filterExtras ||
    !!filterExtrasBefore

  if (!hasAny) return null

  return (
    <div
      className={cn(
        "flex max-w-full items-center gap-2 rounded-md border bg-white p-3 shadow-sm",
        /* Narrow: single horizontal row + scroll (same idea as wide Ant tables) */
        "min-w-0 flex-nowrap overflow-x-auto overflow-y-visible [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]",
        scrollable
          ? "justify-between"
          : "md:flex-wrap md:justify-between md:overflow-x-visible",
      )}
    >
      {children != null && children !== false && (
        <div className="flex shrink-0 items-center">{renderChildrenWithPermissions()}</div>
      )}
      <div
        className={cn(
          "flex min-w-0 shrink-0 flex-nowrap items-center gap-2",
          scrollable ? "ml-auto" : "md:w-auto md:flex-1 md:flex-wrap md:justify-end",
          className,
        )}
      >
        {filterExtrasBefore}

        {showDateRange && onDateRangeChange && (
          <div className="shrink-0">
            <DateRangePickerWithPresets
              date={dateRange}
              onDateChange={onDateRangeChange}
              className="w-[min(280px,calc(100vw-5rem))] md:w-[300px]"
            />
          </div>
        )}

        {showSearch && onSearchChange && (
          <div className="w-[min(18rem,calc(100vw-6rem))] shrink-0 md:min-w-[12rem] md:max-w-sm md:flex-1">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="max-w-none"
            />
          </div>
        )}

        {filterExtras}

        {showRefresh && onRefresh && (
          <Button type="button" variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
