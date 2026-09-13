"use client"

import React, { useState, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { COUNTRY_DIAL_CODES, type CountryDialCode } from "@/lib/constants/country-dial-codes"

interface PhoneInputWithCountryProps {
  prefix: string
  onPrefixChange: (prefix: string) => void
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean | string
  disabled?: boolean
  autoFocus?: boolean
  id?: string
  name?: string
}

/**
 * Renders a high-resolution SVG/PNG country flag with graceful text fallback
 */
function CountryFlag({
  code,
  alt,
  className = "h-3.5 w-5",
}: {
  code: string
  alt?: string
  className?: string
}) {
  const [hasError, setHasError] = useState(false)
  const iso = (code || "").toLowerCase()

  if (hasError || !code) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center font-bold text-[9px] font-mono bg-slate-100 text-slate-700 rounded px-1 border border-slate-200",
          className
        )}
      >
        {code}
      </span>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/28x21/${iso}.png`}
      srcSet={`https://flagcdn.com/56x42/${iso}.png 2x`}
      alt={alt || code}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(
        "inline-block object-cover rounded-[2px] shadow-2xs shrink-0 border border-slate-200/80",
        className
      )}
    />
  )
}

export function PhoneInputWithCountry({
  prefix,
  onPrefixChange,
  value,
  onChange,
  placeholder = "01712345678",
  className,
  error,
  disabled = false,
  autoFocus = false,
  id,
  name,
}: PhoneInputWithCountryProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Clean prefix without +
  const cleanPrefix = (prefix || "880").replace(/^\+/, "")

  // Find active country
  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_DIAL_CODES.find(
        (c) => c.dialCode === cleanPrefix || (cleanPrefix === "88" && c.dialCode === "880")
      ) || COUNTRY_DIAL_CODES[0]
    )
  }, [cleanPrefix])

  // Filtered countries for search
  const filteredPopular = useMemo(() => {
    if (!search.trim()) return COUNTRY_DIAL_CODES.filter((c) => c.popular)
    const q = search.toLowerCase()
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.popular &&
        (c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.dialCode.includes(q))
    )
  }, [search])

  const filteredAll = useMemo(() => {
    if (!search.trim()) return COUNTRY_DIAL_CODES
    const q = search.toLowerCase()
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    )
  }, [search])

  const handleSelectCountry = (country: CountryDialCode) => {
    onPrefixChange(country.dialCode)
    setOpen(false)
    setSearch("")
  }

  return (
    <div
      className={cn(
        "flex items-center h-9 w-full rounded-lg border bg-white shadow-2xs transition-all duration-150 group/container",
        error
          ? "border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500"
          : "border-slate-200 hover:border-slate-300 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500",
        disabled && "opacity-50 cursor-not-allowed bg-slate-50",
        className
      )}
    >
      {/* ── Country Prefix Trigger (Flag + Code + Chevron) ── */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="h-full pl-2.5 pr-2 bg-slate-50/70 hover:bg-slate-100/90 text-xs font-semibold text-slate-700 flex items-center gap-1.5 border-r border-slate-200 transition-all shrink-0 rounded-l-lg select-none cursor-pointer focus:outline-none group/btn"
            title={`${selectedCountry.name} (+${selectedCountry.dialCode})`}
          >
            <CountryFlag code={selectedCountry.code} className="w-[18px] h-[13px]" />
            <span className="font-mono text-slate-800 font-bold text-xs tracking-tight">
              +{selectedCountry.dialCode}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover/btn:text-slate-600 transition-transform duration-150" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[320px] p-0 z-50 shadow-2xl border-slate-200 rounded-xl overflow-hidden"
          align="start"
          onWheel={(e) => e.stopPropagation()}
        >
          <Command className="rounded-xl">
            <CommandInput
              placeholder="Search country or dial code..."
              value={search}
              onValueChange={setSearch}
              className="h-9 text-xs"
            />
            <CommandList
              className="max-h-64 overflow-y-auto overscroll-contain py-1"
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty className="py-5 text-center text-xs text-slate-500 font-medium">
                No matching country found.
              </CommandEmpty>

              {/* Popular Destinations Group */}
              {filteredPopular.length > 0 && (
                <CommandGroup heading="Popular Travel & Business">
                  {filteredPopular.map((c) => {
                    const isSelected =
                      cleanPrefix === c.dialCode || (cleanPrefix === "88" && c.dialCode === "880")
                    return (
                      <CommandItem
                        key={`pop-${c.code}-${c.dialCode}`}
                        value={`${c.name} ${c.code} +${c.dialCode}`}
                        onSelect={() => handleSelectCountry(c)}
                        className="flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer aria-selected:bg-sky-50/80 hover:bg-sky-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CountryFlag code={c.code} className="w-[18px] h-[13px]" />
                          <span className="truncate font-semibold text-slate-800">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">({c.code})</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded shadow-2xs">
                            +{c.dialCode}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-sky-600 font-bold" />}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {filteredPopular.length > 0 && <CommandSeparator />}

              {/* All Countries Group */}
              <CommandGroup heading="All Countries">
                {filteredAll.map((c) => {
                  const isSelected = cleanPrefix === c.dialCode
                  return (
                    <CommandItem
                      key={`all-${c.code}-${c.dialCode}`}
                      value={`${c.name} ${c.code} +${c.dialCode}`}
                      onSelect={() => handleSelectCountry(c)}
                      className="flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer aria-selected:bg-sky-50/80 hover:bg-sky-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag code={c.code} className="w-[18px] h-[13px]" />
                        <span className="truncate font-semibold text-slate-800">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({c.code})</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                          +{c.dialCode}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-sky-600 font-bold" />}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* ── Mobile Input Field + Clear Action ── */}
      <div className="relative flex-1 flex items-center h-full">
        <Input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="h-full border-0 shadow-none focus-visible:ring-0 px-3 text-xs font-mono font-medium text-slate-800 placeholder:text-slate-400 bg-transparent flex-1"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="mr-2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear mobile number"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
