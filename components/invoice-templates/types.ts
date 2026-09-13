/**
 * Invoice Template Engine — Shared Types
 *
 * This is the canonical data contract for all invoice templates.
 * All template components must accept InvoiceTemplateData.
 */

// ─── Template IDs ──────────────────────────────────────────────────
/** Registry keys for all available invoice templates. */
export type InvoiceTemplateId = "classic" | "airline"

// ─── Company Template Config ───────────────────────────────────────
export interface TemplateTypeOverride {
  invoiceType: "other" | "visa" | "non_commission" | "air_ticket" | "umrah" | "refund"
  templateId: InvoiceTemplateId
}

export interface CompanyTemplateConfig {
  _id?: string
  companyId: string
  defaultTemplateId: InvoiceTemplateId
  overrides: TemplateTypeOverride[]
  showWatermark: boolean
  showSignatures: boolean
  showServiceCharge?: boolean
  showVat?: boolean
  showPayment?: boolean
  showDue?: boolean
  showFlightDetails?: number
  signatureUrl?: string
  signatureTitle?: string
  customHeader?: string
  customFooter?: string
}

// ─── Template Data ─────────────────────────────────────────────────
export interface InvoiceCompanyData {
  name: string
  address: string
  address2?: string
  mobileNumber: string
  phone?: string
  email: string
  logoUrl?: string
}

export interface InvoiceClientData {
  name: string
  uniqueId: string
  address: string
  email: string
  mobile: string
  phone?: string
}

export interface InvoiceSummaryData {
  invoiceNo: string
  invoiceDate: string
  salesDate: string
  salesBy: string
  subTotal: number
  discount: number
  serviceCharge?: number
  vatTax?: number
  extraFee?: number
  netTotal: number
  paidAmount: number
  dueAmount: number
  showPrevDue?: boolean
  showDiscount?: boolean
  clientPreviousDue?: number
}

/** Generic billing line item (visa, other, umrah) */
export interface BillingLineItem {
  productName: string
  paxName?: string
  quantity: number
  unitPrice: number
  extraFee?: number
  subTotal: number
  costPrice?: number
  totalCost?: number
  profit?: number
  vendorName?: string
}

/** Ticket-specific line item (non-commission, air-ticket) */
export interface TicketLineItem {
  paxName: string
  ticketNo: string
  pnr: string
  class?: string
  route?: string
  journeyDate?: string
  returnDate?: string
  airline?: string
  unitPrice: number
  totalSales: number
  costPrice?: number
  profit?: number
  vendorName?: string
}

/** Flight/route data (air-ticket / flight segments) */
export interface FlightRouteItem {
  flightNo?: string
  from?: string
  to?: string
  airline?: string
  departureTime?: string
  arrivalTime?: string
}

/** Passport info (visa, umrah) */
export interface PassportItem {
  name?: string
  passportNo?: string
  paxType?: string
  contactNo?: string
  email?: string
  dateOfBirth?: string
  dateOfIssue?: string
  dateOfExpire?: string
}

/** Payment receipt item */
export interface PaymentReceiptItem {
  clientName?: string
  voucherNo?: string
  paymentTo?: string
  paymentMethod?: string
  note?: string
  subTotal: number
  receivedBy?: string
  receiptDate?: string
}

/**
 * The canonical data contract passed to all template components.
 * Constructed from `getInvoiceDetailsSimplified` response on the invoice detail page.
 */
export interface InvoiceTemplateData {
  /** The resolved invoiceType (used by the renderer to choose default template) */
  invoiceType: "other" | "visa" | "non_commission" | "air_ticket" | "umrah" | "refund"
  company: InvoiceCompanyData
  client: InvoiceClientData
  invoice: InvoiceSummaryData
  /** Generic product/service items — visa, other, umrah */
  billingItems: BillingLineItem[]
  /** Ticket rows — non-commission and air-ticket invoices */
  ticketItems?: TicketLineItem[]
  /** Flight route info — air-ticket invoices */
  flightRoutes?: FlightRouteItem[]
  /** Passport/pax info — visa and umrah invoices */
  passports?: PassportItem[]
  /** Payment receipt rows */
  paymentItems?: PaymentReceiptItem[]
}

// ─── Template Component Props ──────────────────────────────────────
export interface InvoiceTemplateProps {
  data: InvoiceTemplateData
  /**
   * Rendering mode:
   * - "invoice"  — public-facing invoice (header + footer shown)
   * - "internal" — internal copy (costs/profit visible, no header/footer)
   * - "payment"  — payment receipt view
   */
  mode: "invoice" | "internal" | "payment"
  config?: Pick<
    CompanyTemplateConfig,
    | "showWatermark"
    | "showSignatures"
    | "showServiceCharge"
    | "showVat"
    | "showPayment"
    | "showDue"
    | "showFlightDetails"
    | "signatureUrl"
    | "signatureTitle"
    | "customHeader"
    | "customFooter"
  >
}
