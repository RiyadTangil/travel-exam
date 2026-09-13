"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { format } from "date-fns"
import { numberToWords } from "@/lib/numberToWords"
import type { InvoiceTemplateProps, BillingLineItem, PaymentReceiptItem } from "./types"

/**
 * Classic Invoice Template
 * Used for: other, visa, umrah (group) invoices.
 *
 * Matching typography, `#EAEFF4` header bands, compact 10.5px text,
 * and unified layout consistent with the Airline template.
 */
export function ClassicInvoiceTemplate({ data, mode, config }: InvoiceTemplateProps) {
  const {
    company,
    invoice,
    client,
    billingItems = [],
    paymentItems = [],
  } = data

  const showWatermark = config?.showWatermark ?? true
  const showSignatures = config?.showSignatures ?? true
  const signatureUrl = config?.signatureUrl
  const signatureTitle = config?.signatureTitle || "Authority Signature"
  const customHeader = config?.customHeader
  const customFooter = config?.customFooter

  const isInternal = mode === "internal"
  const isPayment = mode === "payment"
  const isPaid = invoice.dueAmount <= 0

  const qrValue = `Invoice No: ${invoice.invoiceNo}\nClient: ${client.name}\nNet Total: ${invoice.netTotal}`

  // Shared table cell styles matching design system
  const thStyle = "border border-gray-300 bg-[#EAEFF4] text-gray-800 font-semibold px-2 py-1 text-[10px] text-left select-none"
  const tdStyle = "border border-gray-300 px-2 py-1 text-[10px] text-gray-800 align-middle"
  const tdCenterStyle = "border border-gray-300 px-1 py-1 text-[10px] text-gray-800 text-center align-middle"
  const tdRightStyle = "border border-gray-300 px-2 py-1 text-[10px] text-gray-800 text-right align-middle"

  return (
    <div
      className="relative w-[210mm] max-w-full mx-auto bg-white min-h-[297mm] overflow-hidden text-[10.5px] text-gray-800 border border-gray-200 print:border-none shadow-lg print:shadow-none flex flex-col"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* ── Watermark ──────────────────────────────────────────────── */}
      {showWatermark && (
        <div
          data-headless-hide
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ opacity: 0.035 }}
        >
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt=""
              className="w-72 h-72 object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="text-5xl font-extrabold text-gray-900 tracking-wider uppercase text-center select-none">
              {company.name}
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 px-[10mm] py-[8mm] flex flex-col gap-[10px] flex-1">

        {/* Custom Header Banner (if configured) */}
        {customHeader && (
          <div className="text-center text-[9.5px] text-gray-600 bg-gray-50 border border-gray-200 py-1 px-3 rounded">
            {customHeader}
          </div>
        )}

        {/* ── Top Header: Logo + QR + Company Info ───────────────── */}
        {!isInternal && (
          <div data-headless-hide className="flex items-center justify-between gap-4 pb-1">
            {/* Company Logo */}
            <div className="w-[42mm] flex-shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="max-h-[22mm] max-w-full object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <span className="text-lg font-bold text-red-600 leading-tight">
                  {company.name}
                </span>
              )}
            </div>

            {/* QR Code + Company Contact */}
            <div className="flex items-start gap-3 ml-auto text-[10px]">
              <div className="border border-gray-300 p-[3px] bg-white shadow-sm flex-shrink-0">
                <QRCodeSVG value={qrValue} size={64} />
              </div>
              <div className="flex flex-col gap-[1.5px] max-w-[88mm] text-gray-700">
                <h1 className="text-[14px] font-bold text-gray-900 leading-tight">
                  {company.name}
                </h1>
                <p className="leading-snug">
                  <span className="font-semibold text-gray-900">Address:</span> {company.address}
                </p>
                {company.address2 && (
                  <p className="leading-snug text-gray-600">{company.address2}</p>
                )}
                <p className="leading-snug">
                  <span className="font-semibold text-gray-900">Mobile:</span> {company.mobileNumber}
                  {company.phone ? `, ${company.phone}` : ""}
                </p>
                <p className="leading-snug">
                  <span className="font-semibold text-gray-900">Email:</span> {company.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── INVOICE Badge ───────────────────────────────────────── */}
        {!isInternal && (
          <div className="flex justify-center my-1.5">
            <div className="border border-[#2C3E50] rounded px-6 py-[2px] text-[#2C3E50] font-bold uppercase tracking-widest text-[11.5px] bg-white leading-tight">
              INVOICE
            </div>
          </div>
        )}

        {/* ── Client & Invoice Meta (2-Column Grid) ───────────────── */}
        <div className="grid grid-cols-2 gap-4 pb-1 text-[10.5px]">
          {/* Left: Invoice To */}
          <div className="space-y-[3px]">
            <p className="font-bold text-[11px] text-gray-900 uppercase">Invoice To:</p>
            <p className="leading-snug">
              <span className="font-bold text-gray-900">Name : </span>
              {client.name}
              {client.uniqueId ? ` - (${client.uniqueId})` : ""}
            </p>
            {client.address && (
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Address : </span>
                {client.address}
              </p>
            )}
            {(client.mobile || client.phone) && (
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Mobile : </span>
                {client.phone || client.mobile}
              </p>
            )}
          </div>

          {/* Right: Invoice Metadata (Left-aligned within right-justified box) */}
          <div className="flex justify-end">
            <div className="space-y-[3px] text-left min-w-[150px]">
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Invoice Date : </span>
                {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "dd MMM yyyy") : "—"}
              </p>
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Invoice No : </span>
                {invoice.invoiceNo}
              </p>
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Sales Date : </span>
                {invoice.salesDate ? format(new Date(invoice.salesDate), "dd MMM yyyy") : "—"}
              </p>
              <p className="leading-snug">
                <span className="font-bold text-gray-900">Sales By : </span>
                {invoice.salesBy}
              </p>
            </div>
          </div>
        </div>

        {/* ── BILLING INFO / PAYMENT DETAILS Section ────────────────── */}
        <div className="space-y-[3px] mt-1">
          <div className="text-[10.5px] font-bold text-gray-900 uppercase tracking-wide">
            {isPayment ? "PAYMENT DETAILS" : "BILLING INFO"}
          </div>

          {isPayment ? (
            /* Payment Receipt Table */
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className={`${thStyle} w-[34px] text-center`}>Sl.</th>
                  <th className={thStyle}>Receipt No.</th>
                  <th className={thStyle}>Payment To</th>
                  <th className={thStyle}>Method</th>
                  <th className={thStyle}>Note</th>
                  <th className={`${thStyle} text-right w-[95px]`}>Amount</th>
                  <th className={`${thStyle} w-[95px]`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentItems.length > 0 ? (
                  paymentItems.map((p: PaymentReceiptItem, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
                      <td className={tdCenterStyle}>{i + 1}</td>
                      <td className={`${tdStyle} font-semibold text-sky-700`}>{p.voucherNo || "—"}</td>
                      <td className={tdStyle}>{p.paymentTo?.toUpperCase() || "—"}</td>
                      <td className={tdStyle}>{p.paymentMethod || "—"}</td>
                      <td className={tdStyle}>{p.note || "—"}</td>
                      <td className={`${tdRightStyle} font-medium`}>{p.subTotal?.toLocaleString()}</td>
                      <td className={tdStyle}>
                        {p.receiptDate ? format(new Date(p.receiptDate), "dd MMM yyyy") : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={`${tdCenterStyle} py-4 text-gray-400`}>
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* General Services / Billing Table */
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className={`${thStyle} w-[30px] text-center`}>Sl.</th>
                  <th className={thStyle}>Service Name</th>
                  <th className={`${thStyle} w-[160px]`}>Pax Name</th>
                  <th className={`${thStyle} w-[45px] text-center`}>Qty</th>
                  {isInternal && <th className={`${thStyle} text-right w-[75px]`}>Cost Price</th>}
                  <th className={`${thStyle} text-right w-[75px]`}>Unit Price</th>
                  {(billingItems.some(b => (b.extraFee || 0) > 0)) && (
                    <th className={`${thStyle} text-right w-[65px]`}>Extra Fee</th>
                  )}
                  {isInternal && <th className={`${thStyle} text-right w-[65px] text-green-700`}>Profit</th>}
                  {isInternal && <th className={`${thStyle} w-[85px]`}>Vendor</th>}
                  <th className={`${thStyle} text-right w-[80px]`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.length > 0 ? (
                  billingItems.map((b: BillingLineItem, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
                      <td className={tdCenterStyle}>{i + 1}</td>
                      <td className={`${tdStyle} font-medium`}>{b.productName || "Service"}</td>
                      <td className={`${tdStyle} uppercase`}>{b.paxName || "—"}</td>
                      <td className={tdCenterStyle}>{b.quantity || 1}</td>
                      {isInternal && (
                        <td className={tdRightStyle}>
                          {b.costPrice !== undefined && b.costPrice > 0 ? b.costPrice.toLocaleString() : "—"}
                        </td>
                      )}
                      <td className={tdRightStyle}>{b.unitPrice?.toLocaleString() || "0"}</td>
                      {(billingItems.some(item => (item.extraFee || 0) > 0)) && (
                        <td className={tdRightStyle}>{b.extraFee?.toLocaleString() || "0"}</td>
                      )}
                      {isInternal && (
                        <td className={`${tdRightStyle} font-bold text-green-700`}>
                          {b.profit?.toLocaleString() || "0"}
                        </td>
                      )}
                      {isInternal && <td className={tdStyle}>{b.vendorName || "—"}</td>}
                      <td className={`${tdRightStyle} font-semibold`}>
                        {b.subTotal?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isInternal ? 9 : 6} className={`${tdCenterStyle} py-4 text-gray-400`}>
                      No billing items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Totals Summary (Always follows the pattern from Image) ───────────────────── */}
        {!isInternal && !isPayment && (() => {
          const showPayment = config?.showPayment !== false
          const showDue = config?.showDue !== false
          const showServiceCharge = config?.showServiceCharge !== false

          const subTotal = invoice.subTotal || 0
          const discount = invoice.discount || 0
          const serviceCharge = invoice.serviceCharge || 0
          const totalBeforeVat = subTotal - discount + serviceCharge
          const vat = invoice.vatTax || 0
          const grandTotal = invoice.netTotal || 0

          const hasDiscount = discount > 0
          const hasServiceCharge = showServiceCharge && serviceCharge > 0
          const hasVat = vat > 0
          const showTotalBeforeVat = hasDiscount || hasServiceCharge || hasVat

          return (
            <div className="flex justify-end mt-2">
              <div className="w-[280px] space-y-2">
                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                  <tbody>
                    {/* Sub-Total */}
                    <tr>
                      <td className="border border-gray-400 py-[3px] px-2.5 text-gray-800 bg-white whitespace-nowrap">
                        Sub-Total
                      </td>
                      <td className="border border-gray-400 py-[3px] px-2.5 text-right font-medium text-gray-900 w-[100px] whitespace-nowrap">
                        {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>

                    {/* Less, Discount */}
                    {hasDiscount && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-white whitespace-nowrap">
                          Less, Discount
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-medium text-gray-900 whitespace-nowrap">
                          {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* Add, Agency Service Charge */}
                    {hasServiceCharge && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-white whitespace-nowrap">
                          Add, Agency Service Charge
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-medium text-gray-900 whitespace-nowrap">
                          {serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* Total Amount Before VAT */}
                    {showTotalBeforeVat && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-white whitespace-nowrap">
                          Total Amount Before VAT
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                          {totalBeforeVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* VAT */}
                    {hasVat && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-white whitespace-nowrap">
                          VAT
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-medium text-gray-900 whitespace-nowrap">
                          {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* Grand Total */}
                    <tr>
                      <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-white whitespace-nowrap">
                        Grand Total
                      </td>
                      <td className="border border-gray-400 py-[3px] px-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                        {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>

                    {/* Payment (if enabled) */}
                    {showPayment && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-gray-700 bg-white whitespace-nowrap">
                          Payment
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-bold whitespace-nowrap">
                          {isPaid ? (
                            <span className="text-gray-900">PAID</span>
                          ) : (
                            <span className="text-gray-900">{invoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Previous Due */}
                    {invoice.showPrevDue && (invoice.clientPreviousDue ?? 0) > 0 && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-gray-700 bg-white whitespace-nowrap">
                          Previous Due
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-medium text-gray-900 whitespace-nowrap">
                          {invoice.clientPreviousDue!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* Due (if enabled) */}
                    {showDue && !isPaid && (
                      <tr>
                        <td className="border border-gray-400 py-[3px] px-2.5 font-bold text-red-600 bg-red-50/50 whitespace-nowrap">
                          {invoice.showPrevDue ? "Total Due" : "Due"}
                        </td>
                        <td className="border border-gray-400 py-[3px] px-2.5 text-right font-bold text-red-600 bg-red-50/50 whitespace-nowrap">
                          {(invoice.dueAmount + (invoice.showPrevDue ? invoice.clientPreviousDue || 0 : 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Grand Total in words */}
                <p className="text-[9.5px] text-gray-800 leading-snug">
                  <span className="font-normal">Grand total in word: </span>
                  <span className="font-semibold capitalize">
                    {numberToWords(Math.round(grandTotal))}
                  </span>
                </p>
              </div>
            </div>
          )
        })()}

        {/* Spacer to push signatures to the bottom */}
        <div className="flex-grow min-h-[25px]" />

        {/* Custom Footer Note (if configured) */}
        {customFooter && (
          <div className="text-center text-[9px] text-gray-500 border-t border-gray-200 pt-2">
            {customFooter}
          </div>
        )}

        {/* ── Signatures & Footer Timestamp ───────────────────────── */}
        {!isInternal && showSignatures && (
          <div className="flex justify-between items-end pb-2 pt-4 mt-2">
            {/* Customer Signature */}
            <div className="text-center flex flex-col items-center">
              <div className="h-[14mm] flex items-end justify-center" />
              <div className="w-[40mm] border-t border-dashed border-gray-400 mb-1" />
              <p className="text-[10px] font-semibold text-gray-700">Customer Signature</p>
            </div>

            {/* Date/Timestamp */}
            <div className="text-center text-[9px] text-gray-500 font-normal pb-1">
              {format(new Date(), "MMM d, yyyy h:mm:ss a")}
            </div>

            {/* Authority Signature / Seal */}
            <div className="text-center flex flex-col items-center">
              <div className="h-[14mm] flex items-end justify-center">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Authority Signature"
                    className="max-h-[14mm] max-w-[40mm] object-contain mb-1"
                    crossOrigin="anonymous"
                  />
                ) : null}
              </div>
              <div className="w-[40mm] border-t border-dashed border-gray-400 mb-1" />
              <p className="text-[10px] font-semibold text-gray-700">{signatureTitle}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
