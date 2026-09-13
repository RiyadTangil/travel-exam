"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatCurrencyAmount } from "@/lib/currency"

export interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | string | undefined | null
  onChange?: (val: number) => void
  allowDecimals?: boolean
  decimalPlaces?: number
  currency?: string
}

/**
 * An interactive number input that formats numbers with local currency commas (e.g. BD Lakh & Crore 2,00,000)
 * live while typing, preserving cursor position and decimal values.
 */
export const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  (
    {
      value,
      onChange,
      className,
      placeholder = "0",
      disabled = false,
      allowDecimals = true,
      decimalPlaces = 2,
      currency,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [displayVal, setDisplayVal] = useState<string>("")
    const [isFocused, setIsFocused] = useState(false)

    // Helper to format numeric value to comma separated text
    const formatValue = (raw: number | string | null | undefined): string => {
      if (raw === null || raw === undefined || raw === "") return ""
      const num = typeof raw === "string" ? parseFloat(raw.replace(/,/g, "")) : raw
      if (isNaN(num)) return ""
      if (num === 0 && !isFocused) return ""

      if (typeof raw === "string") {
        const clean = raw.replace(/,/g, "")
        const parts = clean.split(".")
        if (parts.length > 1) {
          const intFormatted = parts[0]
            ? formatCurrencyAmount(parseFloat(parts[0]) || 0, { currency, showDecimals: false })
            : "0"
          return `${intFormatted}.${parts[1].slice(0, decimalPlaces)}`
        }
      }

      return formatCurrencyAmount(num, { currency, showDecimals: false })
    }

    // Synchronize with external value prop
    useEffect(() => {
      if (!isFocused) {
        if (value == null || value === 0 || value === "") {
          setDisplayVal("")
        } else {
          setDisplayVal(formatValue(value))
        }
      }
    }, [value, isFocused])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key) ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return
      }

      // Allow 0-9 digits
      if (/^[0-9]$/.test(e.key)) return

      // Allow single decimal point
      if (allowDecimals && e.key === "." && !displayVal.includes(".")) return

      e.preventDefault()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const rawValue = input.value
      const cursorPos = input.selectionStart || 0

      // Remove everything except numbers and period
      let clean = rawValue.replace(/[^0-9.]/g, "")
      const parts = clean.split(".")
      if (parts.length > 2) {
        clean = parts[0] + "." + parts.slice(1).join("")
      }

      if (clean === "" || clean === ".") {
        setDisplayVal(clean)
        onChange?.(0)
        return
      }

      const numValue = parseFloat(clean)
      const numericVal = isNaN(numValue) ? 0 : numValue

      // Count digits before cursor to maintain accurate cursor location
      const digitsBeforeCursor = rawValue.slice(0, cursorPos).replace(/[^0-9.]/g, "").length

      let newFormatted = ""
      if (parts.length > 1) {
        const intFormatted = parts[0]
          ? formatCurrencyAmount(parseFloat(parts[0]) || 0, { currency, showDecimals: false })
          : "0"
        newFormatted = `${intFormatted}.${parts[1].slice(0, decimalPlaces)}`
      } else {
        newFormatted = formatCurrencyAmount(numericVal, { currency, showDecimals: false })
      }

      setDisplayVal(newFormatted)
      onChange?.(numericVal)

      // Reposition cursor
      requestAnimationFrame(() => {
        if (!input) return
        let newPos = 0
        let countedDigits = 0
        for (let i = 0; i < newFormatted.length; i++) {
          if (newFormatted[i] !== ",") {
            countedDigits++
          }
          if (countedDigits === digitsBeforeCursor) {
            newPos = i + 1
            break
          }
        }
        if (newPos === 0 && digitsBeforeCursor === 0) newPos = 0
        else if (newPos === 0) newPos = newFormatted.length
        input.setSelectionRange(newPos, newPos)
      })
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (value != null && value !== 0 && !displayVal) {
        setDisplayVal(formatValue(value))
      }
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (value != null && value !== 0) {
        setDisplayVal(formatValue(value))
      } else {
        setDisplayVal("")
      }
      onBlur?.(e)
    }

    return (
      <Input
        {...props}
        ref={(node) => {
          inputRef.current = node
          if (typeof forwardedRef === "function") forwardedRef(node)
          else if (forwardedRef) (forwardedRef as any).current = node
        }}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder}
        value={displayVal}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("tabular-nums", className)}
      />
    )
  }
)

FormattedNumberInput.displayName = "FormattedNumberInput"
