/**
 * Centralized Currency System for TravelHisab ERP
 * Allows easily changing or managing currency symbols (BDT ৳, USD $, EUR €, SAR, AED, etc.)
 */

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  numberingSystem: "lakh-crore" | "million-billion"
  decimals: number
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  BDT: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    numberingSystem: "lakh-crore",
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    numberingSystem: "million-billion",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    numberingSystem: "million-billion",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    numberingSystem: "million-billion",
    decimals: 2,
  },
  SAR: {
    code: "SAR",
    symbol: "SAR",
    name: "Saudi Riyal",
    numberingSystem: "million-billion",
    decimals: 2,
  },
  AED: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    numberingSystem: "million-billion",
    decimals: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    numberingSystem: "lakh-crore",
    decimals: 2,
  },
}

/**
 * Active default currency for the system (can be configured via environment or changed here).
 */
export const DEFAULT_CURRENCY_CODE = process.env.NEXT_PUBLIC_CURRENCY_CODE || "BDT"
export const DEFAULT_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "৳"

/**
 * Returns currency symbol for a given currency code (defaults to DEFAULT_CURRENCY_SYMBOL).
 */
export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return DEFAULT_CURRENCY_SYMBOL
  const upper = currencyCode.toUpperCase().trim()
  return SUPPORTED_CURRENCIES[upper]?.symbol || upper || DEFAULT_CURRENCY_SYMBOL
}

/**
 * Global alias for the default currency symbol
 */
export const CURRENCY_SYMBOL = DEFAULT_CURRENCY_SYMBOL

/**
 * Formats a number according to currency numbering conventions.
 * - For BDT/INR: Lakh & Crore grouping (10,00,000 / 1,00,00,000)
 * - For USD/EUR/etc: Million & Billion grouping (1,000,000)
 */
export function formatCurrencyAmount(
  val: number | string | null | undefined,
  options?: {
    currency?: string
    showSymbol?: boolean
    showDecimals?: boolean
    decimalPlaces?: number
  }
): string {
  if (val === null || val === undefined || val === "") return options?.showSymbol ? `${getCurrencySymbol(options.currency)} 0` : "0"
  const num = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(num)) return options?.showSymbol ? `${getCurrencySymbol(options.currency)} 0` : "0"

  const currencyCode = (options?.currency || DEFAULT_CURRENCY_CODE).toUpperCase().trim()
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.BDT
  const isNegative = num < 0
  const absNum = Math.abs(num)

  const minDecimals = options?.showDecimals ? (options?.decimalPlaces ?? config.decimals) : 0
  const maxDecimals = options?.decimalPlaces ?? config.decimals

  let formatted = ""

  if (config.numberingSystem === "lakh-crore") {
    try {
      formatted = absNum.toLocaleString("en-IN", {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals,
      })
    } catch {
      const parts = absNum.toFixed(maxDecimals).split(".")
      let integerPart = parts[0]
      const decimalPart = parts[1]

      const lastThree = integerPart.slice(-3)
      const otherNumbers = integerPart.slice(0, -3)
      if (otherNumbers !== "") {
        integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      }
      formatted = (options?.showDecimals || minDecimals > 0) && decimalPart ? `${integerPart}.${decimalPart}` : integerPart
    }
  } else {
    formatted = absNum.toLocaleString("en-US", {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    })
  }

  const sign = isNegative ? "-" : ""
  if (options?.showSymbol) {
    const sym = getCurrencySymbol(options.currency)
    return `${sign}${sym} ${formatted}`
  }

  return `${sign}${formatted}`
}

/**
 * Backward compatibility aliases
 */
export const formatBDTCurrency = formatCurrencyAmount
export const formatBDT = formatCurrencyAmount

