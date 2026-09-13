"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { format } from "date-fns"
import { numberToWords } from "@/lib/numberToWords"
import type { InvoiceTemplateProps, TicketLineItem, FlightRouteItem, PaymentReceiptItem } from "./types"

/** Helper to cleanly format route strings, stripping only trailing/leading arrows or hyphens while keeping middle forward arrows (e.g. "GYD->YTY->" -> "GYD->YTY") */
export function formatCleanRoute(routeStr?: string): string {
  if (!routeStr) return "—"
  let cleaned = routeStr.trim()
  cleaned = cleaned.replace(/(->|>|-|\s)+$/g, "")
  cleaned = cleaned.replace(/^(->|>|-|\s)+/g, "")
  if (!cleaned) return "—"
  return cleaned
}

/**
 * Airline Invoice Template — Pixel-perfect match with targeted Air Ticket invoice.
 * Used for: air_ticket + non_commission invoices.
 */
export function AirlineInvoiceTemplate({ data, mode, config }: InvoiceTemplateProps) {
  const {
    company,
    invoice,
    client,
    billingItems = [],
    ticketItems = [],
    flightRoutes = [],
    paymentItems = [],
  } = data

  const showWatermark = config?.showWatermark ?? true
  const showSignatures = config?.showSignatures ?? true
  const showFlightDetails = config?.showFlightDetails ?? 0
  const signatureUrl = config?.signatureUrl
  const signatureTitle = config?.signatureTitle || "Authority Signature"
  const customHeader = config?.customHeader
  const customFooter = config?.customFooter

  const isInternal = mode === "internal"
  const isPayment = mode === "payment"
  const isPaid = invoice.dueAmount <= 0

  const qrValue = `Invoice No: ${invoice.invoiceNo}\nClient: ${client.name}\nNet Total: ${invoice.netTotal}`

  // Shared table cell styles matching the target image
  const thStyle = "border border-gray-300 bg-[#EAEFF4] text-gray-800 font-semibold px-2 py-1 text-[10px] text-left select-none"
  const tdStyle = "border border-gray-300 px-2 py-1 text-[10px] text-gray-800 align-middle"
  const tdCenterStyle = "border border-gray-300 px-1 py-1 text-[10px] text-gray-800 text-center align-middle"
  const tdRightStyle = "border border-gray-300 px-2 py-1 text-[10px] text-gray-800 text-right align-middle"

  // Effective ticket rows fallback to billingItems if no ticketItems exist
  const effectiveTickets: TicketLineItem[] = ticketItems.length > 0
    ? ticketItems
    : billingItems.map((b) => ({
        paxName: b.paxName || "",
        ticketNo: "",
        pnr: "",
        class: "",
        route: "",
        journeyDate: "",
        airline: "",
        unitPrice: b.unitPrice,
        totalSales: b.subTotal,
        costPrice: b.costPrice,
        profit: b.profit,
        vendorName: b.vendorName,
      }))

  const hasClass = effectiveTickets.some(
    (t) => Boolean(t.class && t.class.trim() !== "" && t.class.trim() !== "—")
  )

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

        {/* ── FLIGHT/ROUTE DETAILS Section ─────────────────────────── */}
        {showFlightDetails === 1 && !isPayment && flightRoutes.length > 0 && (() => {
          // Check if any segment has time data (from Flight Segments tab input)
          const hasTimings = flightRoutes.some((r: FlightRouteItem) => r.departureTime || r.arrivalTime)
          return (
            <div className="space-y-[3px]">
              <div className="text-[10.5px] font-bold text-gray-900 uppercase tracking-wide">
                FLIGHT/ROUTE DETAILS
              </div>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className={`${thStyle} w-[34px] text-center`}>Sl.</th>
                    <th className={`${thStyle} w-[90px]`}>Flight No</th>
                    <th className={thStyle}>From</th>
                    <th className={thStyle}>To</th>
                    {hasTimings && <th className={`${thStyle} w-[80px]`}>Departure</th>}
                    {hasTimings && <th className={`${thStyle} w-[80px]`}>Arrival</th>}
                    <th className={`${thStyle} w-[150px]`}>Airline</th>
                  </tr>
                </thead>
                <tbody>
                  {flightRoutes.map((r: FlightRouteItem, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
                      <td className={tdCenterStyle}>{i + 1}</td>
                      <td className={`${tdStyle} font-medium`}>{r.flightNo || ""}</td>
                      <td className={tdStyle}>{r.from || "—"}</td>
                      <td className={tdStyle}>{r.to || "—"}</td>
                      {hasTimings && <td className={tdStyle}>{r.departureTime || "—"}</td>}
                      {hasTimings && <td className={tdStyle}>{r.arrivalTime || "—"}</td>}
                      <td className={tdStyle}>{r.airline || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}

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
            /* Tickets / Billing Table */
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className={`${thStyle} w-[30px] text-center`}>Sl.</th>
                  <th className={`${thStyle} w-[100px]`}>Ticket No</th>
                  <th className={thStyle}>Pax Name</th>
                  <th className={`${thStyle} w-[65px]`}>PNR</th>
                  {hasClass && <th className={`${thStyle} w-[65px]`}>Class</th>}
                  <th className={`${thStyle} w-[80px]`}>Route</th>
                  <th className={`${thStyle} w-[85px]`}>Journey Date</th>
                  {isInternal && <th className={`${thStyle} text-right w-[75px]`}>Cost Price</th>}
                  <th className={`${thStyle} text-right w-[75px]`}>Unit Price</th>
                  {isInternal && <th className={`${thStyle} text-right w-[65px] text-green-700`}>Profit</th>}
                  {isInternal && <th className={`${thStyle} w-[85px]`}>Vendor</th>}
                  <th className={`${thStyle} text-right w-[75px]`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {effectiveTickets.map((t: TicketLineItem, i: number) => {
                  let formattedDate = t.journeyDate || "—"
                  if (t.journeyDate) {
                    try {
                      formattedDate = format(new Date(t.journeyDate), "dd MMM yyyy")
                    } catch {
                      formattedDate = t.journeyDate
                    }
                  }
                  return (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
                      <td className={tdCenterStyle}>{i + 1}</td>
                      <td className={`${tdStyle} font-medium`}>{t.ticketNo || "—"}</td>
                      <td className={`${tdStyle} uppercase font-medium`}>{t.paxName || "—"}</td>
                      <td className={tdStyle}>{t.pnr || "—"}</td>
                      {hasClass && <td className={tdStyle}>{t.class || "—"}</td>}
                      <td className={tdStyle}>{formatCleanRoute(t.route)}</td>
                      <td className={tdStyle}>{formattedDate}</td>
                      {isInternal && (
                        <td className={tdRightStyle}>
                          {t.costPrice !== undefined && t.costPrice > 0 ? t.costPrice.toLocaleString() : "—"}
                        </td>
                      )}
                      <td className={tdRightStyle}>{t.unitPrice?.toLocaleString() || "0"}</td>
                      {isInternal && (
                        <td className={`${tdRightStyle} font-bold text-green-700`}>
                          {t.profit?.toLocaleString() || "0"}
                        </td>
                      )}
                      {isInternal && <td className={tdStyle}>{t.vendorName || "—"}</td>}
                      <td className={`${tdRightStyle} font-semibold`}>
                        {t.totalSales?.toLocaleString() || t.unitPrice?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  )
                })}
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
