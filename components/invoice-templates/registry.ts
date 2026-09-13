/**
 * Invoice Template Registry
 *
 * Central map of templateId → component.
 * To add a new template: import it here and add an entry to INVOICE_TEMPLATE_REGISTRY.
 *
 * Default templates:
 *  - "classic"  → visa, other, umrah (group) — generic product/billing table
 *  - "airline"  → air_ticket, non_commission  — flight/route + ticket/PNR table
 */

import { ClassicInvoiceTemplate } from "./classic-template"
import { AirlineInvoiceTemplate } from "./airline-template"
import type { InvoiceTemplateId } from "./types"
import type { ComponentType } from "react"
import type { InvoiceTemplateProps } from "./types"

export const INVOICE_TEMPLATE_REGISTRY: Record<
  InvoiceTemplateId,
  ComponentType<InvoiceTemplateProps>
> = {
  classic: ClassicInvoiceTemplate,
  airline: AirlineInvoiceTemplate,
}

/**
 * Default template per invoiceType if no company config exists.
 * air_ticket + non_commission → airline
 * everything else             → classic
 */
export const DEFAULT_TEMPLATE_BY_TYPE: Record<string, InvoiceTemplateId> = {
  air_ticket: "airline",
  non_commission: "airline",
  visa: "classic",
  other: "classic",
  umrah: "classic",
  refund: "airline",
}

/**
 * Resolve the effective templateId for a given invoiceType + company config.
 * Priority: per-type override → company default → system default by type → "airline"
 */
export function resolveTemplateId(
  invoiceType: string,
  config?: {
    defaultTemplateId?: string
    overrides?: Array<{ invoiceType: string; templateId: string }>
  } | null
): InvoiceTemplateId {
  // 1. Per-type override from company config
  const override = config?.overrides?.find((o) => o.invoiceType === invoiceType)
  if (override?.templateId && override.templateId in INVOICE_TEMPLATE_REGISTRY) {
    return override.templateId as InvoiceTemplateId
  }

  // 2. Company-wide default
  if (config?.defaultTemplateId && config.defaultTemplateId in INVOICE_TEMPLATE_REGISTRY) {
    return config.defaultTemplateId as InvoiceTemplateId
  }

  // 3. System default by invoice type
  return DEFAULT_TEMPLATE_BY_TYPE[invoiceType] ?? "airline"
}
