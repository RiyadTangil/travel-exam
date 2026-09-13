# Combined Client Implementation Tracker & Comprehensive Test Plan

## Overview
This document tracks the end-to-end implementation and verification of **Combined Clients** (Clients acting as Vendors) across all modules in TravelHisab ERP.
- **Client remains the primary master entity** (`db.clients`).
- A client can be flagged with `isCombined: true`.
- **Zero schema changes to `models/vendor.ts`** (Pure Client approach, no duplicate/shadow records).
- Combined clients automatically appear in the **Vendor list** (`/dashboard/vendors`), **Vendor Selection** dropdowns (`VendorSelection`), **Vendor Payment**, **Vendor Advance Return**, and all invoice modules.
- **Single Unified Balance:** Both sales (receivables) and purchases (payables) modify the same live client balance (`Client.presentBalance`), automatically offsetting each other in real-time.
- **Unified 4-Way Ledger:** Displays Sales Invoices, Purchase Costs, Money Receipts, Vendor Payments, and Vendor Advance Returns chronologically.

---

## 1. Master Implementation Steps Table (Full Navigation Audit)

| Step # | Module / Route (`lib/navigation.tsx`) | Files & Methods Modified | Backend Service & Business Logic (`services/`) | Status |
| :---: | :--- | :--- | :--- | :---: |
| **STEP 1** | `Clients`<br>(`/dashboard/clients-manager`) | • [`models/client.ts`](file:///c:/job/travel_pro/models/client.ts) | [`services/clientsService.ts`](file:///c:/job/travel_pro/services/clientsService.ts)<br>• Add `isCombined: { type: Boolean, default: false, index: true }` to ClientSchema.<br>• `models/vendor.ts` remains completely untouched. | `[x] DONE` |
| **STEP 2** | `Clients`<br>(`/dashboard/clients-manager`) | • [`services/clientsService.ts`](file:///c:/job/travel_pro/services/clientsService.ts)<br>• [`controllers/clientsManagerController.ts`](file:///c:/job/travel_pro/controllers/clientsManagerController.ts)<br>• [`app/api/clients-manager/route.ts`](file:///c:/job/travel_pro/app/api/clients-manager/route.ts) | [`services/clientsService.ts`](file:///c:/job/travel_pro/services/clientsService.ts)<br>• In `listClients`: support `combinedFilter` parameter (`"regular"`: `{ isCombined: { $ne: true } }`, `"combined"`: `{ isCombined: true }`, `"all"`: no filter).<br>• In `createClient` & `updateClientById`: handle `isCombined: boolean` field. | `[x] DONE` |
| **STEP 3** | `Clients`<br>(`/dashboard/clients-manager`) | • [`app/dashboard/clients-manager/page.tsx`](file:///c:/job/travel_pro/app/dashboard/clients-manager/page.tsx)<br>• [`components/clients/add-client-modal.tsx`](file:///c:/job/travel_pro/components/clients/add-client-modal.tsx)<br>• [`components/clients/client-table.tsx`](file:///c:/job/travel_pro/components/clients/client-table.tsx) | [`services/clientsService.ts`](file:///c:/job/travel_pro/services/clientsService.ts)<br>• Add 2 Tabs at top: **Tab 1: "Clients"** (regular) and **Tab 2: "Combined Clients"**.<br>• Add switch in Add/Edit modal: *"Combined Client (Can act as Vendor)"*.<br>• Add `[Combined]` badge in client table. | `[x] DONE` |
| **STEP 4** | `Invoices (All 6 Types)`:<br>• `/dashboard/invoices`<br>• `/dashboard/invoices-air-ticket`<br>• `/dashboard/invoices-visa`<br>• `/dashboard/invoices-non-commission`<br>• `/dashboard/invoices-group`<br>• `/dashboard/invoices-hajj-pre-registration` | • [`app/api/vendors/selection/route.ts`](file:///c:/job/travel_pro/app/api/vendors/selection/route.ts)<br>• [`services/vendorService.ts`](file:///c:/job/travel_pro/services/vendorService.ts)<br>• [`components/shared/vendor-selection.tsx`](file:///c:/job/travel_pro/components/shared/vendor-selection.tsx) | [`services/vendorService.ts`](file:///c:/job/travel_pro/services/vendorService.ts)<br>• Update `getVendorSelection` to query `db.vendors` PLUS `db.clients` where `isCombined: true`.<br>• Return formatted label: `"${name} (Combined Client)"`.<br>• Enables selecting Combined Clients as line-item vendors across all invoice types. | `[x] DONE` |
| **STEP 5** | `Vendors -> Vendor List`<br>(`/dashboard/vendors`) | • [`services/vendorService.ts`](file:///c:/job/travel_pro/services/vendorService.ts)<br>• [`app/api/vendors/route.ts`](file:///c:/job/travel_pro/app/api/vendors/route.ts)<br>• [`app/dashboard/vendors/page.tsx`](file:///c:/job/travel_pro/app/dashboard/vendors/page.tsx) | [`services/vendorService.ts`](file:///c:/job/travel_pro/services/vendorService.ts)<br>• In `getVendors`: include `Client.find({ isCombined: true })` in results.<br>• Tag rows with badge `[Combined Client]` and quick action to view Client profile / ledger. | `[x] DONE` |
| **STEP 6** | `Invoices (All 6 Types)` | • [`services/invoiceService.ts`](file:///c:/job/travel_pro/services/invoiceService.ts)<br>• [`controllers/invoiceController.ts`](file:///c:/job/travel_pro/controllers/invoiceController.ts) | [`services/invoiceService.ts`](file:///c:/job/travel_pro/services/invoiceService.ts)<br>• In `adjustVendorInvoiceCostBalance`: check if `vendorId` exists in `Client`. If client: `$inc: { presentBalance: +totalCost }` (purchase cost offsets what client owes us!). If vendor: `$inc: { presentBalance: -totalCost }`.<br>• In `getInvoiceById`: resolve vendor names from both `Vendor` and `Client` so invoice item vendor names display correctly. | `[x] DONE` |
| **STEP 7** | `Vendors -> Vendor Payment`<br>(`/dashboard/vendors/payment`) | • [`services/vendorPaymentService.ts`](file:///c:/job/travel_pro/services/vendorPaymentService.ts)<br>• [`controllers/vendorPaymentController.ts`](file:///c:/job/travel_pro/controllers/vendorPaymentController.ts) | [`services/vendorPaymentService.ts`](file:///c:/job/travel_pro/services/vendorPaymentService.ts)<br>• In `createVendorPayment`: if `vendorId` is a Client, update `Client.presentBalance` (`$inc: { presentBalance: -amount }`).<br>• Log `ClientTransaction` with `clientId: vendorId`, `direction: "debit"`, `transactionType: "vendor_payment"`.<br>• In `getVendorSummaryByInvoice`: check invoice items where `vendorId` is a combined client. | `[x] DONE` |
| **STEP 8** | `Refund`<br>• `/dashboard/refund/airticket`<br>• `/dashboard/refund/other` | • [`services/refundService.ts`](file:///c:/job/travel_pro/services/refundService.ts) | [`services/refundService.ts`](file:///c:/job/travel_pro/services/refundService.ts)<br>• In `createAirticketRefund`: if `vendorId` is a Client, update `Client.presentBalance` instead of `Vendor.updateOne`.<br>• Resolve vendor names from Combined Clients for display. | `[x] DONE` |
| **STEP 9** | `Vendors -> Advance Return`<br>(`/dashboard/vendors/advance-return`) | • [`services/vendorAdvanceReturnService.ts`](file:///c:/job/travel_pro/services/vendorAdvanceReturnService.ts)<br>• [`components/vendors/vendor-advance-return-modal.tsx`](file:///c:/job/travel_pro/components/vendors/vendor-advance-return-modal.tsx) | [`services/vendorAdvanceReturnService.ts`](file:///c:/job/travel_pro/services/vendorAdvanceReturnService.ts)<br>• Support Combined Client `vendorId` in `createVendorAdvanceReturn`, `updateVendorAdvanceReturn`, `deleteVendorAdvanceReturn`.<br>• Route balance adjustment through `applyVendorOrCombinedBalanceUpdate`.<br>• In `listVendorAdvanceReturns` and `getVendorAdvanceReturnById`: populate Combined Client names properly so rows do not show "Unknown".<br>• Record `clientId` in `ClientTransaction` for combined clients. | `[x] DONE` |
| **STEP 10** | `Accounts -> Bill Adjustment`<br>(`/dashboard/bill-adjustment`) | • [`services/billAdjustmentService.ts`](file:///c:/job/travel_pro/services/billAdjustmentService.ts) | [`services/billAdjustmentService.ts`](file:///c:/job/travel_pro/services/billAdjustmentService.ts)<br>• In `persistBillAdjustmentLedger`: when adjusting a Vendor that is a Combined Client, resolve client details instead of expecting `Vendor.findById`.<br>• Ensure `ClientTransaction` links to `clientId` appropriately. | `[x] DONE` |
| **STEP 11** | `Reports -> Client Ledger`<br>(`/dashboard/reports/client-ledger`) | • [`services/clientLedgerService.ts`](file:///c:/job/travel_pro/services/clientLedgerService.ts) | [`services/clientLedgerService.ts`](file:///c:/job/travel_pro/services/clientLedgerService.ts)<br>• Include all 5 transaction operations in the unified stream:<br>  1. Sales Invoices (Debit)<br>  2. Money Receipts (Credit)<br>  3. Purchases from client (Credit - offsets due)<br>  4. Vendor Payments (Debit)<br>  5. Vendor Advance Returns (Credit - returns cash back)<br>• Compute running balance matching live `Client.presentBalance`. | `[x] DONE` |
| **STEP 12** | `Reports -> Vendor Ledger`<br>(`/dashboard/reports/vendor-ledger`) | • [`services/vendorLedgerService.ts`](file:///c:/job/travel_pro/services/vendorLedgerService.ts) | [`services/vendorLedgerService.ts`](file:///c:/job/travel_pro/services/vendorLedgerService.ts)<br>• Support viewing vendor activity stream for Combined Clients via `getCombinedClientAsVendorDoc`. | `[x] DONE` |
| **STEP 13** | `Reports -> Purchase & Payment`<br>(`/dashboard/reports/vendor_wise_purchase_and_payment`) | • [`services/vendorPurchasePaymentService.ts`](file:///c:/job/travel_pro/services/vendorPurchasePaymentService.ts) | [`services/vendorPurchasePaymentService.ts`](file:///c:/job/travel_pro/services/vendorPurchasePaymentService.ts)<br>• In `getVendorPurchasePaymentReport`: resolve item vendor details from `Client` when `vendorId` is a combined client. | `[x] DONE` |
| **STEP 14** | `Reports -> Total Due/Advance`<br>(`/dashboard/reports/total-due-advance/vendors`) | • [`services/vendorReportService.ts`](file:///c:/job/travel_pro/services/vendorReportService.ts) | [`services/vendorReportService.ts`](file:///c:/job/travel_pro/services/vendorReportService.ts)<br>• Support querying Combined Clients in vendor balance statistics report. | `[x] DONE` |
| **STEP 15** | **Automated E2E Test Suite** | • [`scripts/test-combined-client-e2e.ts`](file:///c:/job/travel_pro/scripts/test-combined-client-e2e.ts) | Complete end-to-end verification covering all 14 steps, self-dealing prevention, revert protection, and deletion guard against live MongoDB.<br>**Result: 32 PASSED, 0 FAILED** | `[x] DONE` |

---

## 2. Test Cases Specification

### Test Suite: Combined Client Full Lifecycle & Accounting Verification

#### TC-01: Client Creation (Regular vs. Combined)
- **Action:** Create "Client A" with `isCombined = false` and "Client B" with `isCombined = true`.
- **Validation:**
  - "Client A" appears only in Tab 1 ("Clients").
  - "Client B" appears in Tab 2 ("Combined Clients").
  - "Client B" appears in `/api/vendors/selection` with label `"Client B (Combined Client)"`.
  - "Client A" does NOT appear in vendor selection.

#### TC-02: Sales Invoicing (Balance Decrement)
- **Action:** Issue a Sales Invoice to "Client B" for 50,000 BDT.
- **Validation:**
  - `Client.presentBalance` decreases from `0` to `-50,000` (Due: 50,000 BDT).
  - `ClientTransaction` created with `clientId = Client B._id`, `direction = "debit"`, `transactionType = "invoice"`.

#### TC-03: Purchase from Combined Client (Automatic Balance Offset)
- **Action:** Issue an Air Ticket Invoice to a third-party customer, selecting "Client B" as the line-item **Vendor** with purchase cost = 20,000 BDT.
- **Validation:**
  - In `InvoiceItem`, `vendorId` stores `Client B._id`.
  - `Client.presentBalance` **increases** by +20,000 BDT from `-50,000` to `-30,000` (Due automatically reduced to 30,000 BDT!).
  - `models/vendor.ts` is NOT modified.

#### TC-04: Client Editing & Data Integrity
- **Action:** Edit "Client B" (update phone number, email, and address).
- **Validation:**
  - Client data successfully updates in `db.clients`.
  - Vendor selection dropdown dynamically displays updated information.
  - Balance remains strictly preserved at `-30,000`.

#### TC-05: Money Receipt Collection
- **Action:** Create a Money Receipt of 20,000 BDT from "Client B".
- **Validation:**
  - `Client.presentBalance` increases from `-30,000` to `-10,000` (Remaining due: 10,000 BDT).
  - Cash/Bank account balance increases by +20,000 BDT.

#### TC-06: Vendor Payment Disbursement
- **Action:** Disburse a Vendor Payment of 5,000 BDT to "Client B" for supplied ticket costs.
- **Validation:**
  - `Client.presentBalance` decreases from `-10,000` to `-15,000`.
  - Cash/Bank account balance decreases by -5,000 BDT.
  - `ClientTransaction` logged with `transactionType = "vendor_payment"`.

#### TC-07: Vendor Advance Return from Combined Client
- **Action:** Record a Vendor Advance Return of 3,000 BDT from "Client B" back into company bank account.
- **Validation:**
  - Cash/Bank account balance increases by +3,000 BDT.
  - `Client.presentBalance` increases by +3,000 (from `-15,000` to `-12,000`).
  - `/dashboard/vendors/advance-return` displays row with `vendorName = "Client B (Combined Client)"` (not "Unknown").
  - `ClientTransaction` logged with `transactionType = "vendor_advance_return"`.

#### TC-08: Vendor Total Due / Advance Report
- **Action:** Query `getVendorsTotalDueAdvance` for "Client B".
- **Validation:**
  - "Client B" is included in the vendor list with name `"Client B (Combined Client)"`.
  - Correct net debit/credit figures aggregated.

#### TC-09: Ledger Verification (Chronological 5-Way Stream)
- **Action:** Query `getClientLedger` for "Client B".
- **Validation:**
  - Entry 1: Sales Invoice (+50,000 Debit)
  - Entry 2: Purchase Cost (+20,000 Credit)
  - Entry 3: Money Receipt (+20,000 Credit)
  - Entry 4: Vendor Payment (+5,000 Debit)
  - Entry 5: Vendor Advance Return (+3,000 Credit)
  - Final running balance: 12,000 BDT Due (`Client.presentBalance = -12,000`).

#### TC-10: Shared Bridge Fallback
- **Action:** Check `checkIsCombinedClient` for regular clients and invalid ObjectIds.
- **Validation:** Safely returns `false` without throwing.

#### TC-11: Self-Dealing Prevention
- **Action:** Create an invoice selecting "Client B" as both the Client (Buyer) and Vendor (Supplier) on line items.
- **Validation:** Rejected with HTTP 400 Bad Request (`"The same party cannot be selected as both the Client and Vendor on the same invoice."`).

#### TC-12: Combined Client Revert Protection
- **Action:** Attempt to update `isCombined: false` on a client with active vendor items/payments.
- **Validation:** Blocked with HTTP 400 (`"Cannot revert a combined client to regular client while vendor purchases or vendor payments exist."`).

#### TC-13: Deletion Protection
- **Action:** Attempt to delete a combined client with active vendor records.
- **Validation:** Blocked with HTTP 400 (`"Cannot delete client with existing vendor purchases or payments"`).

#### TC-14: Combined Client Bill Adjustment Lifecycle
- **Action:** Create a DEBIT adjustment for a Combined Client and delete it.
- **Validation:**
  - Balance adjusted from `0` to `-1500` (Due: 1500 BDT).
  - `ClientTransaction` created and linked to `clientId`.
  - Deleting adjustment safely reverses the balance back to `0`.

---

## 3. Automated Test Script Execution Plan (`scripts/test-combined-client-e2e.ts`)

```bash
npx tsx --env-file=.env scripts/test-combined-client-e2e.ts
```
**Latest Test Run:** `36 PASSED, 0 FAILED (100% Green)`

