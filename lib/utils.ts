import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a Date object or date string (e.g. "2026-08-19", "2026-08-19T00:00:00.000Z")
 * into a local Date object preserving local year, month, and day without UTC offset shift.
 */
export function parseLocalDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null

    // Match YYYY-MM-DD or YYYY/MM/DD prefix
    let match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)
      const d = new Date(year, month, day)
      return isNaN(d.getTime()) ? null : d
    }

    // Match DD-MM-YYYY or DD/MM/YYYY prefix
    match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (match) {
      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const year = parseInt(match[3], 10)
      const d = new Date(year, month, day)
      return isNaN(d.getTime()) ? null : d
    }

    const d = new Date(trimmed)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Formats a Date object or date string to YYYY-MM-DD string in local timezone (never UTC).
 */
export function formatLocalDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const parsed = parseLocalDate(date)
  if (!parsed) return ""
  return format(parsed, "yyyy-MM-dd")
}

export const toYmd = formatLocalDate
export const parseYmdLocal = parseLocalDate

/**
 * Compares two party identifiers (client ID vs vendor ID) to determine if they refer to the same party.
 * Handles string IDs and populated objects with `_id` or `id`.
 */
export function isSameParty(a?: any, b?: any): boolean {
  if (!a || !b) return false
  const idA = typeof a === "object" ? String(a._id || a.id || "") : String(a)
  const idB = typeof b === "object" ? String(b._id || b.id || "") : String(b)
  return Boolean(idA && idB && idA.trim().toLowerCase() === idB.trim().toLowerCase())
}


export {
  CURRENCY_SYMBOL,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_SYMBOL,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  formatCurrencyAmount,
  formatCurrencyAmount as formatBDTCurrency,
  formatCurrencyAmount as formatBDT,
} from "./currency"



