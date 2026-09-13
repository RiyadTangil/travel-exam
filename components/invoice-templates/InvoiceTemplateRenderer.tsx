"use client"

import * as React from "react"
import { INVOICE_TEMPLATE_REGISTRY, resolveTemplateId } from "./registry"
import type { InvoiceTemplateData, CompanyTemplateConfig, InvoiceTemplateProps } from "./types"

interface InvoiceTemplateRendererProps {
  /** The full invoice data (from getInvoiceDetailsSimplified) */
  data: InvoiceTemplateData
  /**
   * Rendering mode:
   * - "invoice"   public-facing invoice
   * - "internal"  internal copy with costs
   * - "payment"   payment receipt view
   */
  mode: "invoice" | "internal" | "payment"
  /** Company template configuration from DB (or null for system defaults) */
  templateConfig?: CompanyTemplateConfig | null
}

/**
 * InvoiceTemplateRenderer
 *
 * The smart dispatcher. Given invoice data + a company's template config,
 * it resolves which template component to render and passes all required props.
 *
 * Resolution priority:
 *   per-type override → company default → system default by invoiceType → "classic"
 */
export function InvoiceTemplateRenderer({
  data,
  mode,
  templateConfig,
}: InvoiceTemplateRendererProps) {
  const templateId = resolveTemplateId(data.invoiceType, templateConfig)
  const TemplateComponent = INVOICE_TEMPLATE_REGISTRY[templateId] ?? INVOICE_TEMPLATE_REGISTRY["airline"]

  const configProps: InvoiceTemplateProps["config"] = {
    showWatermark: templateConfig?.showWatermark ?? true,
    showSignatures: templateConfig?.showSignatures ?? true,
    showServiceCharge: templateConfig?.showServiceCharge ?? true,
    showVat: templateConfig?.showVat ?? true,
    showPayment: templateConfig?.showPayment ?? true,
    showDue: templateConfig?.showDue ?? true,
    showFlightDetails: templateConfig?.showFlightDetails ?? 0,
    signatureUrl: templateConfig?.signatureUrl,
    signatureTitle: templateConfig?.signatureTitle,
    customHeader: templateConfig?.customHeader,
    customFooter: templateConfig?.customFooter,
  }

  return <TemplateComponent data={data} mode={mode} config={configProps} />
}
