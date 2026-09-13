/**
 * Visa Enums and Status Numeric Mappings for Database Storage Optimization
 * Standardized according to AGENTS.md rules.
 * Uses centralized country mappings from @/lib/constants/countries.ts.
 */

import { getCountryName, getCountryId } from "@/lib/constants/countries"

export { getCountryName as countryNumToString }

export function countryStringToNum(str?: string | null): number {
  return getCountryId(str)
}

export const VISA_STATUS_ENUM = {
  MEDICAL_PENDING: 1,
  MOFA_DONE: 2,
  WAITING_EMBASSY: 3,
  MANPOWER_PENDING: 4,
  DELIVERY_COMPLETE: 5,
} as const

export const VISA_STATUS_LABEL_MAP: Record<number, string> = {
  [VISA_STATUS_ENUM.MEDICAL_PENDING]: "Medical Pending",
  [VISA_STATUS_ENUM.MOFA_DONE]: "MOFA Done",
  [VISA_STATUS_ENUM.WAITING_EMBASSY]: "Waiting Embassy",
  [VISA_STATUS_ENUM.MANPOWER_PENDING]: "Manpower Pending",
  [VISA_STATUS_ENUM.DELIVERY_COMPLETE]: "Delivery Complete",
}

export const VISA_STATUS_CODE_MAP: Record<string, number> = {
  "medical pending": VISA_STATUS_ENUM.MEDICAL_PENDING,
  "mofa done": VISA_STATUS_ENUM.MOFA_DONE,
  "waiting embassy": VISA_STATUS_ENUM.WAITING_EMBASSY,
  "manpower pending": VISA_STATUS_ENUM.MANPOWER_PENDING,
  "delivery complete": VISA_STATUS_ENUM.DELIVERY_COMPLETE,
}

export function statusNumToString(num?: number | null): string {
  if (num === undefined || num === null) return "Medical Pending"
  return VISA_STATUS_LABEL_MAP[num] || "Medical Pending"
}

export function statusStringToNum(str?: string | null): number {
  if (!str) return VISA_STATUS_ENUM.MEDICAL_PENDING
  const normalized = str.trim().toLowerCase()
  return VISA_STATUS_CODE_MAP[normalized] ?? VISA_STATUS_ENUM.MEDICAL_PENDING
}
