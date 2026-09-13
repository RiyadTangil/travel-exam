"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
  label: string
  value: string
}

interface ClearableSelectProps {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
  loading?: boolean
  onSearch?: (search: string) => void
  onBottomReached?: () => void
  renderBeforeOptions?: React.ReactNode | ((close: () => void) => React.ReactNode)
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode
  renderValue?: (option: Option) => React.ReactNode
  onOpenChange?: (open: boolean) => void
  label?: string
}

export function ClearableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled,
  error,
  loading,
  onSearch,
  onBottomReached,
  renderBeforeOptions,
  renderOption,
  renderValue,
  onOpenChange,
  label,
}: ClearableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  const [search, setSearch] = React.useState("")

  const selected = options.find((option) => option.value === value || option.label === value)

  const handleSelect = (currentValue: string) => {
    onChange?.(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
  }

  React.useEffect(() => {
    if (onSearch) {
      onSearch(search)
    }
  }, [search, onSearch])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 1) {
      onBottomReached?.()
    }
  }

  const selectElement = (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selected ? (renderValue ? renderValue(selected) : selected.label) : placeholder}
          </span>
          <div className="flex items-center gap-1">
             {value && !disabled && (
                <div 
                  className="rounded-full hover:bg-slate-200 p-0.5 cursor-pointer z-10" 
                  onClick={handleClear}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <X className="h-3 w-3 opacity-50 hover:opacity-100" />
                </div>
             )}
             <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="min-w-[--radix-popover-trigger-width] w-auto max-w-[450px] p-0" 
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={!onSearch}>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} value={search} onValueChange={setSearch} />
          {renderBeforeOptions && (
            <div className="border-b">
              {typeof renderBeforeOptions === "function"
                ? (renderBeforeOptions as any)(() => setOpen(false))
                : renderBeforeOptions}
            </div>
          )}
          <CommandList 
            onScroll={handleScroll}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between cursor-pointer py-2.5 px-3"
                >
                  <span className={cn(
                    "truncate transition-colors",
                    (selected?.value === option.value || value === option.value) ? "text-[#005CC1] font-semibold" : "text-slate-700"
                  )}>
                    {renderOption ? renderOption(option, selected?.value === option.value || value === option.value) : option.label}
                  </span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-200",
                      (selected?.value === option.value || value === option.value) ? "opacity-100 scale-100 text-[#005CC1]" : "opacity-0 scale-75"
                    )}
                  />
                </CommandItem>
              ))}
              {loading && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  Loading more...
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  if (label) {
    return (
      <div className="relative w-full">
        <label className="absolute -top-2 left-10 z-10 bg-white px-1 text-[9px] font-medium text-gray-500 pointer-events-none">
          {label}
        </label>
        {selectElement}
      </div>
    )
  }

  return selectElement
}
