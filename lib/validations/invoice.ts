import { z } from "zod"

// ─── Shared primitives ────────────────────────────────────────────────────────

const ObjectIdString = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid 24-character ObjectId")

const OptionalObjectId = ObjectIdString.optional().or(z.literal("")).transform(v => v || undefined)

const NonNegative = z.number({ invalid_type_error: "Must be a number" }).min(0).default(0)
const DateString = z.string().trim().min(1, "Date is required")

// ─── Money Receipt sub-schema (inline with invoice creation) ─────────────────
//
// Inline receipt is optional: the UI may still send a `moneyReceipt` object with
// display-only fields (e.g. accountName, transNo) or invoice-level flags wrongly
// nested (showPrevDue, showDiscount).  We strip to known keys and only validate
// the full schema when the payload would actually create a receipt — same gate
// as `invoiceService` (`paymentMethod` truthy and `amount > 0`).

export const InlineMoneyReceiptSchema = z.object({
  amount: z.number().min(0, "Amount cannot be negative"),
  paymentMethod: z.string().trim().optional().default(""),
  paymentMethodId: z.string().trim().min(1, " paymentMethodId is required"),
  accountId: z.string().trim().min(1, "accountId is required"),
  accountName: z.string().optional().default(""),
  paymentDate: z.string().trim().min(1, "paymentDate is required"),
  discount: NonNegative,
  note: z.string().optional().default(""),
  receiptNo: z.string().optional().default(""),
  transNo: z.string().optional().default(""),
  showPrevDue: z.string().optional().default("no"),
  showDiscount: z.string().optional().default("yes"),
})

function normalizeOptionalInlineMoneyReceipt(raw: unknown): unknown {
  if (raw == null || raw === "") return undefined
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined
  const o = raw as Record<string, unknown>
  
  const stripped = {
    amount: o.amount,
    paymentMethod: o.paymentMethod,
    paymentMethodId: o.paymentMethodId,
    accountId: o.accountId,
    accountName: o.accountName,
    paymentDate: o.paymentDate,
    discount: o.discount,
    note: o.note,
    receiptNo: o.receiptNo,
    transNo: o.transNo,
    showPrevDue: o.showPrevDue,
    showDiscount: o.showDiscount,
  }

  const method = typeof stripped.paymentMethod === "string" ? stripped.paymentMethod.trim() : ""
  const methodId = typeof stripped.paymentMethodId === "string" ? stripped.paymentMethodId.trim() : ""
  const rawAmt = stripped.amount
  const amtNum =
    typeof rawAmt === "number"
      ? rawAmt
      : rawAmt !== undefined && rawAmt !== null && rawAmt !== ""
        ? Number(rawAmt)
        : NaN
  
  const willCreateReceipt = (method.length > 0 || methodId.length > 0) && Number.isFinite(amtNum) && amtNum > 0
  if (!willCreateReceipt) return undefined
  return stripped
}

/** Use on invoice payloads; omits or validates inline money receipt. */
export const OptionalInlineMoneyReceiptSchema = z.preprocess(
  normalizeOptionalInlineMoneyReceipt,
  InlineMoneyReceiptSchema.optional(),
)

// ─── Billing item — standard / visa ──────────────────────────────────────────

export const BillingItemSchema = z.object({
  /**
   * `product` holds the product's ObjectId string (from the dropdown) OR a
   * free-text product name.  When it IS a valid ObjectId it is also stored as
   * `productId` in InvoiceItem so we can do relational lookups.
   */
  product: z.string().trim().default(""),
  paxName: z.string().trim().default(""),
  description: z.string().trim().default(""),
  quantity: z.number().min(0).default(1),
  unitPrice: NonNegative,
  costPrice: NonNegative,
  totalSales: NonNegative,
  totalCost: NonNegative,
  profit: z.number().default(0),
  extraFee: NonNegative,
  /** VendorId ObjectId string — required by back-end to update vendor balance */
  vendor: z.string().trim().default(""),
  /** Visa-specific optional fields */
  country: z.string().optional(),
  visaType: z.string().optional(),
  visaDuration: z.string().optional(),
  token: z.string().optional(),
  delivery: z.string().optional(),
  visaNo: z.string().optional(),
  mofaNo: z.string().optional(),
  okalaNo: z.string().optional(),
}).transform(item => ({
  ...item,
  /** Derive productId deterministically — never guess */
  productId: /^[0-9a-fA-F]{24}$/.test(item.product) ? item.product : undefined,
}))

export const BillingSummarySchema = z.object({
  items: z.array(BillingItemSchema).min(1, "At least one billing item is required"),
  subtotal: NonNegative,
  totalCost: NonNegative,
  discount: NonNegative,
  serviceCharge: NonNegative,
  vatTax: NonNegative,
  netTotal: z.number().min(0, "Net total cannot be negative"),
  note: z.string().default(""),
  reference: z.string().default(""),
})

// ─── Passport / ticket / hotel / transport sub-schemas ───────────────────────

const PassportEntrySchema = z.object({
  passportNo: z.string().optional().default(""),
  name: z.string().optional().default(""),
  paxType: z.string().optional().default(""),
  contactNo: z.string().optional().default(""),
  email: z.string().optional().default(""),
  dateOfBirth: z.string().optional(),
  dateOfIssue: z.string().optional(),
  dateOfExpire: z.string().optional(),
  passportId: z.string().optional(),
}).passthrough()

const TicketEntrySchema = z.object({
  ticketNo: z.string().optional().default(""),
  pnr: z.string().optional().default(""),
  route: z.string().optional().default(""),
  journeyDate: z.string().optional(),
  returnDate: z.string().optional(),
  airlineId: OptionalObjectId,
  referenceNo: z.string().optional().default(""),
}).passthrough()

const HotelEntrySchema = z.object({
  hotelName: z.string().optional().default(""),
  referenceNo: z.string().optional().default(""),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  roomType: z.string().optional().default(""),
}).passthrough()

const TransportEntrySchema = z.object({
  transportType: z.string().optional().default(""),
  referenceNo: z.string().optional().default(""),
  pickupPlace: z.string().optional().default(""),
  dropOffPlace: z.string().optional().default(""),
}).passthrough()

const HajiEntrySchema = z.object({
  name: z.string().optional().default(""),
  trackingNo: z.string().optional().default(""),
  preRegYear: z.string().optional().default(""),
  mobile: z.string().optional().default(""),
  dob: z.string().optional().default(""),
  nid: z.string().optional().default(""),
  voucherNo: z.string().optional().default(""),
  serialNo: z.string().optional().default(""),
  gender: z.string().optional().default("Male"),
  mahramName: z.string().optional().default(""),
  mahramRelation: z.string().optional().default(""),
  possibleHajjYear: z.string().optional().default(""),
  status: z.string().optional().default("Processed"),
}).passthrough()

// ─── other / Visa / Umrah / Hajj Pre-Reg invoice payload ───────────────────────

export const StandardInvoiceSchema = z.object({
  invoiceType: z.enum(["other", "visa", "umrah", "hajj_pre_reg"]).default("other"),
  entryMode: z.coerce.number().optional(),
  general: z.object({
    invoiceNo: z.string().trim().min(1, "Invoice number is required"),
    salesDate: DateString,
    dueDate: z.string().optional().default(""),
    clientId: z.string().trim().min(1, "Client is required"),
    employeeId: z.string().trim().min(1, "Sales person is required"),
    agentId: z.string().optional().default(""),
    salesByName: z.string().optional().default(""),
    groupId: z.string().optional().default(""),
    entryMode: z.coerce.number().optional(),
  }),
  billing: BillingSummarySchema,
  passport: z.array(PassportEntrySchema).optional().default([]),
  ticket: z.array(TicketEntrySchema).optional().default([]),
  hotel: z.array(HotelEntrySchema).optional().default([]),
  transport: z.array(TransportEntrySchema).optional().default([]),
  haji: z.array(HajiEntrySchema).optional().default([]),
  moneyReceipt: OptionalInlineMoneyReceiptSchema,
  showPrevDue: z.boolean().optional().default(false),
  showDiscount: z.boolean().optional().default(false),
  agentCommission: NonNegative,
  clientPreviousDue: NonNegative,
})

export type StandardInvoicePayload = z.infer<typeof StandardInvoiceSchema>

// ─── Non-commission invoice payload ──────────────────────────────────────────

const PaxEntrySchema = z.object({
  passportId: z.string().optional().default(""),
  name: z.string().optional().default(""),
  paxType: z.string().optional().default(""),
  contactNo: z.string().optional().default(""),
  email: z.string().optional().default(""),
  dob: z.string().optional(),
  dateOfIssue: z.string().optional(),
  dateOfExpire: z.string().optional(),
}).passthrough()

const FlightEntrySchema = z.object({
  flightNo: z.string().optional().default(""),
  airlineId: OptionalObjectId,
  from: z.string().optional().default(""),
  to: z.string().optional().default(""),
  flyDate: z.string().optional(),
  departureTime: z.string().optional().default(""),
  arrivalTime: z.string().optional().default(""),
}).passthrough()

const NonCommTicketDetailsSchema = z.object({
  ticketNo: z.string().trim().min(1, "Ticket number is required"),
  pnr: z.string().optional().default(""),
  gdsPnr: z.string().optional().default(""),
  vendor: z.string().trim().min(1, "Vendor is required"),
  airlineId: ObjectIdString,
  route: z.string().optional().default(""),
  clientPrice: z.number().min(0, "Client price must be ≥ 0"),
  purchasePrice: z.number().min(0, "Purchase price must be ≥ 0"),
  extraFee: z.number().min(0).optional().default(0),
  paxName: z.string().optional().default(""),
  issueDate: z.string().optional(),
  journeyDate: z.string().optional(),
  returnDate: z.string().optional(),
  ticketType: z.string().optional().default(""),
  airbusClass: z.string().optional().default(""),
})

export const NonCommissionInvoiceItemSchema = z.object({
  ticketDetails: NonCommTicketDetailsSchema,
  paxEntries: z.array(PaxEntrySchema).default([]),
  flightEntries: z.array(FlightEntrySchema).default([]),
  profit: z.number().default(0),
})

const NonCommBillingSummarySchema = z.object({
  netTotal: z.number().min(0, "Net total cannot be negative"),
  discount: NonNegative,
  serviceCharge: NonNegative,
  vatTax: NonNegative,
  agentCommission: NonNegative,
  showPrevDue: z.string().optional(),
  showDiscount: z.string().optional(),
  note: z.string().optional().default(""),
  reference: z.string().optional().default(""),
})

export const NonCommissionInvoiceSchema = z.object({
  entryMode: z.coerce.number().optional(),
  general: z.object({
    invoiceNo: z.string().trim().min(1, "Invoice number is required"),
    salesDate: DateString,
    dueDate: z.string().optional().default(""),
    clientId: z.string().trim().min(1, "Client is required"),
    employeeId: z.string().trim().min(1, "Sales person is required"),
    agentId: z.string().optional().default(""),
    entryMode: z.coerce.number().optional(),
  }),
  items: z.array(NonCommissionInvoiceItemSchema).min(1, "At least one ticket is required"),
  billing: NonCommBillingSummarySchema,
})

export type NonCommissionInvoicePayload = z.infer<typeof NonCommissionInvoiceSchema>

// ─── Air Ticket invoice payload ──────────────────────────────────────────────

const AirTicketDetailsSchema = z.object({
  ticketNo: z.string().trim().min(1, "Ticket number is required"),
  pnr: z.string().optional().default(""),
  gdsPnr: z.string().optional().default(""),
  vendor: z.string().trim().min(1, "Vendor is required"),
  airlineId: ObjectIdString,
  route: z.string().optional().default(""),
  clientPrice: z.number().min(0, "Client price must be ≥ 0"),
  purchasePrice: z.number().min(0, "Purchase price must be ≥ 0"),
  grossFare: z.number().min(0).optional().default(0),
  baseFare: z.number().min(0).optional().default(0),
  commissionPercent: z.number().min(0).optional().default(0),
  aitType: z.string().optional().default("Profit"),
  discountType: z.string().optional().default("Amount"),
  discountValue: z.number().optional().default(0),
  bonusType: z.string().optional().default("Amount"),
  bonusValue: z.number().optional().default(0),
  extraFee: z.number().min(0).optional().default(0),
  otherExpense: z.number().min(0).optional().default(0),
  vat: z.number().min(0).optional().default(0),
  paxName: z.string().optional().default(""),
  issueDate: z.string().optional(),
  ticketType: z.string().optional().default(""),
  airbusClass: z.string().optional().default(""),
})

const CountryTaxesSchema = z.record(z.string(), z.number())

export const AirTicketInvoiceItemSchema = z.object({
  ticketDetails: AirTicketDetailsSchema,
  countryTaxes: CountryTaxesSchema,
  paxEntries: z.array(PaxEntrySchema).default([]),
  flightEntries: z.array(FlightEntrySchema).default([]),
  profit: z.number().default(0),
})

export const AirTicketInvoiceSchema = z.object({
  entryMode: z.coerce.number().optional(),
  general: z.object({
    invoiceNo: z.string().trim().min(1, "Invoice number is required"),
    salesDate: DateString,
    dueDate: z.string().optional().default(""),
    clientId: z.string().trim().min(1, "Client is required"),
    employeeId: z.string().trim().min(1, "Sales person is required"),
    agentId: z.string().optional().default(""),
    entryMode: z.coerce.number().optional(),
  }),
  items: z.array(AirTicketInvoiceItemSchema).min(1, "At least one ticket is required"),
  billing: NonCommBillingSummarySchema, // Re-use the same billing summary shape
})

export type AirTicketInvoicePayload = z.infer<typeof AirTicketInvoiceSchema>

// ─── Helper: parse and return typed errors ───────────────────────────────────

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join(".")
    result[path || "_root"] = issue.message
  }
  return result
}
