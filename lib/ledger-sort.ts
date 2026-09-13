/**
 * Ledger Entry Display Order
 * ==========================
 * Defines the logical display sequence for same-day ClientTransaction entries
 * in ledger reports (client ledger, vendor ledger).
 *
 * Sort priority (lower number = earlier in the ledger):
 *   0 - Opening Balance   (baseline row, always first)
 *   1 - Invoice / Cost    (the business transaction that created the movement)
 *   2 - Payments          (money received/paid against that invoice)
 *   3 - Returns           (advance returns, vendor advance returns)
 *   4 - Adjustments       (bill adjustments, refunds, non-invoice income)
 *   5 - Expenses          (operating costs)
 *   6 - Transfers         (internal balance transfers)
 *
 * Industry reference: Xero / QuickBooks sort journal entries by
 * transaction type within a date, then by entry sequence.
 *
 * SINGLE SOURCE OF TRUTH - import from here, never duplicate inline.
 */
export const LEDGER_TYPE_ORDER: Record<string, number> = {
  opening_balance:       0,
  invoice:               1,
  vendor_payment:        2,
  money_receipt:         2,
  advance_return:        3,
  vendor_advance_return: 3,
  bill_adjustment:       4,
  refund:                4,
  non_invoice_income:    4,
  expense:               5,
  balance_transfer:      6,
}

function toLocalDateKey(val: any): string {
  if (!val) return ""
  const d = new Date(val)
  if (isNaN(d.getTime())) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Deterministic chronological comparator for ledger entries.
 *
 * Sort levels:
 *   1. Calendar day ASC       - normalized so UTC timezone differences map to same day
 *   2. Opening Balance first  - baseline row, always at the top of its day
 *   3. Creation Time (_createdAt ASC) - exact serial chronological order of transactions
 *
 * Usage:
 *   entries.sort(ledgerEntryComparator)
 */
export function ledgerEntryComparator(
  a: { date: any; _type: string; _createdAt: any },
  b: { date: any; _type: string; _createdAt: any }
): number {
  const dayA = toLocalDateKey(a.date)
  const dayB = toLocalDateKey(b.date)
  if (dayA !== dayB) {
    return dayA.localeCompare(dayB)
  }

  // Opening balance always stays first on its day
  if (a._type === "opening_balance" && b._type !== "opening_balance") return -1
  if (b._type === "opening_balance" && a._type !== "opening_balance") return 1

  // True serial chronological sequence by system creation timestamp
  const timeA = a._createdAt ? new Date(a._createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0)
  const timeB = b._createdAt ? new Date(b._createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0)
  if (timeA !== timeB) {
    return timeA - timeB
  }

  return 0
}

export const OPENING_BALANCE_BF_ID = "opening-balance-bf"

/**
 * Checks if a ledger list already contains an actual opening balance transaction.
 */
export function hasOpeningBalanceInEntries(entries: Array<any>): boolean {
  return entries.some(
    (e) =>
      e &&
      e.id !== OPENING_BALANCE_BF_ID &&
      (e._type === "opening_balance" ||
       e.transactionType === "opening_balance" ||
       (typeof e.particulars === "string" && e.particulars.toLowerCase().includes("opening balance")))
  )
}

/**
 * Creates the standard brought-forward ("Last Balance:") synthetic ledger row.
 */
export function createBroughtForwardEntry(
  openingBalance: number,
  extraFields: Record<string, any> = {}
) {
  return {
    id: OPENING_BALANCE_BF_ID,
    date: "",
    particulars: "Last Balance:",
    voucherNo: "",
    paxName: "",
    pnr: "",
    ticketNo: "",
    route: "",
    journeyDate: "",
    returnDate: "",
    payType: "",
    debit: 0,
    credit: 0,
    balance: openingBalance,
    note: "",
    mrNote: "",
    vpNote: "",
    invNote: "",
    _type: "opening_balance",
    _createdAt: new Date(0).toISOString(),
    ...extraFields,
  }
}