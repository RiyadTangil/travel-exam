"use client"

import { useRef, useState, useEffect } from "react"
import { Modal, Button, InputNumber, Input, Divider, Select, DatePicker, Switch, message } from "antd"
import { Download, FileText, Building2, Mail, MapPin, Phone, CheckCircle2, Edit3, Paperclip, CreditCard, DollarSign } from "lucide-react"
import dayjs from "dayjs"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const { RangePicker } = DatePicker

interface SubscriptionBillModalProps {
  open: boolean
  onCancel: () => void
  company: any | null
  onAttach?: (attachment: { name: string; size: number; base64: string }) => void
  attachButtonText?: string
}

// Travel Hisab (SaaS vendor) static info
const TRAVELHISAB = {
  name: "Travel Hisab",
  tagline: "Smart ERP for Travel Agencies",
  email: "support@travelhisab.com",
  phone: "01830799683",
  website: "travelhisab.com",
  dhakaOffice: "Cha-87 (3rd Floor), Thana Road, North Badda, Dhaka",
  corporateOffice: "Bagichagong, shordardbari, Comilla",
}

function getBillNumber(company: any): string {
  const id = (company?.id || "").slice(-6).toUpperCase() || "000000"
  const date = dayjs().format("YYYYMM")
  return `TH-${date}-${id}`
}

export function SubscriptionBillModal({ open, onCancel, company, onAttach, attachButtonText }: SubscriptionBillModalProps) {
  const billRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isAttaching, setIsAttaching] = useState(false)

  // ── Editable pricing & meta state ──
  const [subPrice, setSubPrice] = useState<number>(8000)
  const [installPrice, setInstallPrice] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [paidAmount, setPaidAmount] = useState<number>(8000)
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer")
  const [paymentDate, setPaymentDate] = useState<dayjs.Dayjs | null>(dayjs())
  const [subDesc, setSubDesc] = useState<string>("TravelHisab ERP – SaaS Subscription")
  const [subDuration, setSubDuration] = useState<string>("1 Year")
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs(),
    dayjs().add(1, "year").subtract(1, "day"),
  ])
  const [installDesc, setInstallDesc] = useState<string>("Installation & Onboarding")
  const [dueInDays, setDueInDays] = useState<number>(7)
  const [bankName, setBankName] = useState<string>("Islami Bank Bangladesh PLC")
  const [accName, setAccName] = useState<string>("Riyad hasan")
  const [accNo, setAccNo] = useState<string>("2050 314 02 03854502")
  const [branch, setBranch] = useState<string>("Chandina Branch, Cumilla")
  const [showPaymentInfo, setShowPaymentInfo] = useState<boolean>(true)
  const [showSignatures, setShowSignatures] = useState<boolean>(false)

  useEffect(() => {
    if (company?.subscription?.currentPeriodStart && company?.subscription?.currentPeriodEnd) {
      setDateRange([dayjs(company.subscription.currentPeriodStart), dayjs(company.subscription.currentPeriodEnd)])
    } else {
      setDateRange([dayjs(), dayjs().add(1, "year").subtract(1, "day")])
    }
    setSubDuration("1 Year")
    setSubPrice(8000)
    setPaidAmount(8000)
    setPaymentMethod("Bank Transfer")
    setPaymentDate(dayjs())
  }, [company?.id, open])

  const handleDurationChange = (val: string) => {
    setSubDuration(val)
    const start = (dateRange && dateRange[0]) || dayjs()
    if (val === "1 Year") {
      setDateRange([start, start.add(1, "year").subtract(1, "day")])
    } else if (val === "2 Years") {
      setDateRange([start, start.add(2, "year").subtract(1, "day")])
    } else if (val === "1 Month") {
      setDateRange([start, start.add(1, "month").subtract(1, "day")])
    } else if (val === "3 Months") {
      setDateRange([start, start.add(3, "month").subtract(1, "day")])
    } else if (val === "6 Months") {
      setDateRange([start, start.add(6, "month").subtract(1, "day")])
    }
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]])
    } else {
      setDateRange([null, null])
    }
  }

  if (!company) return null

  const billNo = getBillNumber(company)
  const issueDate = dayjs().format("DD MMM YYYY")
  const dueDate = dayjs().add(dueInDays, "day").format("DD MMM YYYY")
  const periodLabel =
    dateRange && dateRange[0] && dateRange[1]
      ? subDuration && subDuration !== "Custom"
        ? `Duration: ${subDuration} (${dateRange[0].format("DD MMM YYYY")} – ${dateRange[1].format("DD MMM YYYY")})`
        : `Period: ${dateRange[0].format("DD MMM YYYY")} – ${dateRange[1].format("DD MMM YYYY")}`
      : subDuration && subDuration !== "Custom"
      ? `Duration: ${subDuration}`
      : ""

  // Financial calculations
  const subTotal = subPrice + installPrice
  const invoiceTotal = Math.max(0, subTotal - discount)
  const safePaidAmount = Math.max(0, paidAmount)
  const balanceDue = Math.max(0, invoiceTotal - safePaidAmount)
  const isPaidInFull = invoiceTotal > 0 && safePaidAmount >= invoiceTotal
  const isPartiallyPaid = safePaidAmount > 0 && safePaidAmount < invoiceTotal
  const isUnpaid = safePaidAmount === 0

  const statusText = isPaidInFull
    ? "PAID"
    : isPartiallyPaid
    ? "PARTIALLY PAID"
    : "DUE"

  const paidDateStr = paymentDate ? paymentDate.format("DD MMM YYYY") : issueDate

  const handleDownload = () => {
    setIsDownloading(true)

    const origin = window.location.origin
    const travelHisabLogo = `${origin}/main_log_bgremoved.png`
    const clientLogo = company.logoUrl
      ? company.logoUrl.startsWith("http")
        ? company.logoUrl
        : `${origin}${company.logoUrl}`
      : null

    const installRow =
      installPrice > 0
        ? `<tr>
            <td style="color:#94a3b8">02</td>
            <td>
              <div class="item-name">${installDesc}</div>
              <div class="item-desc">One-time setup &amp; onboarding support</div>
            </td>
            <td style="text-align:center">1</td>
            <td style="text-align:right">${installPrice.toLocaleString()}</td>
            <td>${installPrice.toLocaleString()}</td>
          </tr>`
        : `<tr>
            <td style="color:#94a3b8">02</td>
            <td>
              <div class="item-name">${installDesc}</div>
              <div class="item-desc">One-time setup &amp; onboarding support</div>
            </td>
            <td style="text-align:center">1</td>
            <td style="text-align:right; color:#94a3b8">—</td>
            <td style="color:#16a34a">Included</td>
          </tr>`

    const discountRow =
      discount > 0
        ? `<div class="totals-row"><span class="totals-key">Discount</span><span class="totals-val" style="color:#dc2626">- BDT ${discount.toLocaleString()}</span></div>`
        : ""

    const paidRow =
      safePaidAmount > 0
        ? `<div class="totals-row"><span class="totals-key" style="color:#059669;font-weight:600">Amount Paid</span><span class="totals-val" style="color:#059669;font-weight:700">BDT ${safePaidAmount.toLocaleString()}</span></div>`
        : ""

    const statusBadgeClass = isPaidInFull
      ? "status-badge-paid"
      : isPartiallyPaid
      ? "status-badge-partial"
      : "status-badge-due"

    const statusStampClass = isPaidInFull
      ? "stamp-paid"
      : isPartiallyPaid
      ? "stamp-partial"
      : "stamp-due"

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Subscription Invoice – ${company.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @page { size: A4 portrait; margin: 0; }
    html, body { height: 100%; margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-container { display: flex; flex-direction: column; justify-content: space-between; height: 297mm; max-height: 297mm; padding: 12mm 14mm 8mm 14mm; box-sizing: border-box; overflow: hidden; }
    .main-content { flex: 1 0 auto; }
    .bottom-section { margin-top: auto; padding-top: 10px; page-break-inside: avoid; }
    .header-band { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2.5px solid #0ea5e9; margin-bottom: 18px; }
    .vendor-block { display: flex; align-items: center; gap: 14px; }
    .vendor-logo { height: 48px; width: auto; object-fit: contain; }
    .vendor-name { font-size: 17px; font-weight: 800; color: #0f172a; }
    .vendor-tagline { font-size: 9px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
    .vendor-contact { font-size: 9.5px; color: #475569; margin-top: 2px; }
    .bill-meta { text-align: right; max-width: 320px; }
    .bill-label-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 9px; margin-bottom: 5px; }
    .bill-label { font-size: 26px; font-weight: 800; color: #0ea5e9; text-transform: uppercase; letter-spacing: 2px; line-height: 1; }
    .status-stamp { display: inline-block; padding: 3px 9px; font-size: 10px; font-weight: 800; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.08em; border: 1.5px solid; }
    .stamp-paid { color: #059669; border-color: #059669; background: #ecfdf5; }
    .stamp-partial { color: #d97706; border-color: #d97706; background: #fffbeb; }
    .stamp-due { color: #0284c7; border-color: #0ea5e9; background: #f0f9ff; }
    .bill-meta-address { font-size: 8.5px; color: #64748b; line-height: 1.45; }
    .bill-meta-contact { font-size: 9px; color: #0ea5e9; font-weight: 600; margin-top: 3px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
    .section-label { font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 7px; }
    .bill-to-box { background: #f8fafc; border-left: 3px solid #0ea5e9; padding: 12px 14px; border-radius: 0 6px 6px 0; }
    .client-logo { height: 36px; width: auto; object-fit: contain; margin-bottom: 8px; display: block; }
    .client-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
    .client-detail { font-size: 10px; color: #475569; line-height: 1.7; }
    .inv-box { padding: 12px 14px; background: #f0f9ff; border-radius: 6px; }
    .inv-row { display: flex; justify-content: space-between; align-items: center; padding: 4.5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 10px; }
    .inv-row:last-child { border-bottom: none; }
    .inv-key { color: #64748b; font-weight: 500; }
    .inv-val { font-weight: 600; color: #0f172a; }
    .status-badge { display: inline-block; padding: 2px 7px; font-size: 8.5px; font-weight: 700; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-badge-paid { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .status-badge-partial { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .status-badge-due { background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table thead tr { background: #0ea5e9; color: white; height: 34px; }
    .items-table th { padding: 0 12px; height: 34px; vertical-align: middle; text-align: left; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; line-height: 34px; }
    .items-table th:last-child { text-align: right; }
    .items-table td { padding: 9px 12px; font-size: 10.5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .items-table td:last-child { text-align: right; font-weight: 600; }
    .items-table tbody tr:nth-child(even) { background: #f8fafc; }
    .item-name { font-weight: 600; color: #0f172a; }
    .item-desc { font-size: 9px; color: #64748b; margin-top: 2px; }
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 18px; }
    .totals-box { width: 250px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4.5px 0; border-bottom: 1px solid #e2e8f0; font-size: 10.5px; }
    .totals-row:last-child { border-bottom: none; }
    .totals-key { color: #475569; }
    .totals-val { font-weight: 600; color: #0f172a; }
    .net-row { border-radius: 6px; padding: 9px 13px; display: flex; justify-content: space-between; margin-top: 7px; }
    .net-key { color: white; font-weight: 700; font-size: 11.5px; }
    .net-val { color: white; font-weight: 800; font-size: 14px; }
    .payment-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }
    .payment-head { font-size: 9.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .payment-label { font-size: 9px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 3px; }
    .payment-row { font-size: 9.5px; color: #334155; line-height: 1.55; }
    .payment-row strong { color: #0f172a; }
    .acc-number { font-family: monospace; font-weight: 700; font-size: 10px; color: #0369a1; background: #e0f2fe; padding: 1px 5px; border-radius: 3px; letter-spacing: 0.5px; }
    .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 8px; }
    .sig-block { text-align: center; }
    .sig-line { width: 100px; border-top: 1px solid #94a3b8; margin: 0 auto 5px; }
    .sig-label { font-size: 9px; color: #64748b; font-weight: 600; }
    .thank-you { text-align: center; font-size: 11px; font-weight: 600; color: #0ea5e9; }
    .bottom-brand-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 12px; font-size: 8.5px; color: #94a3b8; }
    .brand-wing { color: #64748b; font-weight: 500; }
    .brand-wing strong { color: #0284c7; }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="main-content">
      <div class="header-band">
        <div class="vendor-block">
          <img class="vendor-logo" src="${travelHisabLogo}" alt="TravelHisab Logo" id="th-logo" />
          <div>
            <div class="vendor-name">${TRAVELHISAB.name}</div>
            <div class="vendor-tagline">${TRAVELHISAB.tagline}</div>
            <div class="vendor-contact">${TRAVELHISAB.email} | ${TRAVELHISAB.phone}</div>
          </div>
        </div>
        <div class="bill-meta">
          <div class="bill-label-wrap">
            <span class="status-stamp ${statusStampClass}">${statusText}</span>
            <span class="bill-label">Invoice</span>
          </div>
          <div class="bill-meta-address">
            <div><strong>Dhaka Office:</strong> ${TRAVELHISAB.dhakaOffice}</div>
            <div><strong>Corporate Office:</strong> ${TRAVELHISAB.corporateOffice}</div>
          </div>
          <div class="bill-meta-contact">${TRAVELHISAB.website}</div>
        </div>
      </div>

      <div class="two-col">
        <div>
          <div class="section-label">Bill To</div>
          <div class="bill-to-box">
            ${clientLogo ? `<img class="client-logo" src="${clientLogo}" alt="${company.name} Logo" id="client-logo" />` : ""}
            <div class="client-name">${company.name}</div>
            ${company.address ? `<div class="client-detail">📍 ${company.address}${company.address2 ? ", " + company.address2 : ""}</div>` : ""}
            <div class="client-detail">✉️ ${company.email}</div>
            ${company.mobileNumber ? `<div class="client-detail">📞 ${company.mobileNumber}</div>` : ""}
          </div>
        </div>
        <div>
          <div class="section-label">Invoice Details</div>
          <div class="inv-box">
            <div class="inv-row"><span class="inv-key">Bill No</span><span class="inv-val">${billNo}</span></div>
            <div class="inv-row"><span class="inv-key">Issue Date</span><span class="inv-val">${issueDate}</span></div>
            <div class="inv-row"><span class="inv-key">Due Date</span><span class="inv-val">${dueDate}</span></div>
            <div class="inv-row"><span class="inv-key">Payment Status</span><span class="inv-val"><span class="status-badge ${statusBadgeClass}">${statusText}</span></span></div>
            ${safePaidAmount > 0 ? `
            <div class="inv-row"><span class="inv-key">Payment Method</span><span class="inv-val">${paymentMethod}</span></div>
            <div class="inv-row"><span class="inv-key">Payment Date</span><span class="inv-val">${paidDateStr}</span></div>
            ` : ""}
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Description</th>
            <th style="width:80px; text-align:center">Qty</th>
            <th style="width:120px; text-align:right">Unit Price (BDT)</th>
            <th style="width:130px">Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="color:#94a3b8">01</td>
            <td>
              <div class="item-name">${subDesc}</div>
              ${periodLabel ? `<div class="item-desc">${periodLabel}</div>` : ""}
            </td>
            <td style="text-align:center">1</td>
            <td style="text-align:right">${subPrice.toLocaleString()}</td>
            <td>${subPrice.toLocaleString()}</td>
          </tr>
          ${installRow}
        </tbody>
      </table>

      <div class="totals-wrap">
        <div class="totals-box">
          <div class="totals-row"><span class="totals-key">Sub Total</span><span class="totals-val">BDT ${subTotal.toLocaleString()}</span></div>
          ${discountRow}
          <div class="totals-row" style="font-weight:600"><span class="totals-key" style="color:#0f172a">Total Amount</span><span class="totals-val">BDT ${invoiceTotal.toLocaleString()}</span></div>
          ${paidRow}
          <div class="net-row" style="${isPaidInFull ? 'background:#059669;' : isPartiallyPaid ? 'background:#d97706;' : 'background:#0ea5e9;'}">
            <span class="net-key">${isPaidInFull ? "Balance Due (Paid in Full)" : "Balance Due"}</span>
            <span class="net-val">BDT ${balanceDue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div> <!-- /.main-content -->

    <div class="bottom-section">
      ${showPaymentInfo ? (isPaidInFull ? `
      <div class="payment-box" style="background:#f0fdf4; border:1px solid #bbf7d0;">
        <div class="payment-head" style="color:#166534; border-bottom:1px solid #bbf7d0;">
          <span>Payment Settlement – Paid in Full</span>
          <span style="color:#16a34a; font-weight:700; font-size:9.5px; text-transform:none">Ref: <strong>${billNo}</strong></span>
        </div>
        <div class="payment-grid">
          <div>
            <div class="payment-row"><strong>Settlement Status:</strong> <span style="color:#16a34a; font-weight:700">✓ Fully Settled</span></div>
            <div class="payment-row"><strong>Payment Method:</strong> ${paymentMethod}</div>
          </div>
          <div>
            <div class="payment-row"><strong>Amount Received:</strong> BDT ${safePaidAmount.toLocaleString()}</div>
            <div class="payment-row"><strong>Payment Date:</strong> ${paidDateStr}</div>
          </div>
        </div>
        <div style="margin-top:6px; font-size:8.5px; color:#15803d; border-top:1px dashed #bbf7d0; padding-top:5px;">
          Thank you for choosing Travel Hisab! Payment has been received in full. For queries contact <strong>${TRAVELHISAB.email}</strong> or call <strong>${TRAVELHISAB.phone}</strong>.
        </div>
      </div>
      ` : `
      <div class="payment-box">
        <div class="payment-head">
          <span>Payment Details – Bank Transfer</span>
          <span style="color:#64748b; font-weight:500; font-size:9px; text-transform:none">Reference: <strong>${billNo}</strong></span>
        </div>
        <div class="payment-grid">
          <div>
            <div class="payment-row"><strong>Bank Name:</strong> ${bankName}</div>
            <div class="payment-row"><strong>A/C Name:</strong> ${accName}</div>
          </div>
          <div>
            <div class="payment-row"><strong>Account No:</strong> <span class="acc-number">${accNo}</span></div>
            <div class="payment-row"><strong>Branch:</strong> ${branch}</div>
          </div>
        </div>
        <div style="margin-top: 6px; font-size: 8.5px; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 5px;">
          ${safePaidAmount > 0 
            ? `BDT ${safePaidAmount.toLocaleString()} received via ${paymentMethod}. Please transfer the remaining balance of <strong>BDT ${balanceDue.toLocaleString()}</strong> within the due date.` 
            : `Please transfer the total amount of <strong>BDT ${invoiceTotal.toLocaleString()}</strong> via BEFTN / NPSB / Direct Deposit within the due date.`} For queries contact <strong>${TRAVELHISAB.email}</strong> or call <strong>${TRAVELHISAB.phone}</strong>.
        </div>
      </div>
      `) : ""}

      ${showSignatures ? `
      <div class="sig-row">
        <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Customer Signature</div></div>
        <div class="thank-you">Thank you for choosing Travel Hisab! 🙏</div>
        <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Authorized by Travel Hisab</div></div>
      </div>
      ` : ""}

      <div class="bottom-brand-row">
        <div class="brand-wing">Travel Hisab — A wing of <strong>mybdsoft.com</strong></div>
        <div>travelhisab.com</div>
      </div>
    </div>
  </div> <!-- /.page-container -->

  <script>
    var imgs = document.querySelectorAll('img'), total = imgs.length, loaded = 0;
    function tryPrint() { window.focus(); window.print(); }
    if (total === 0) { setTimeout(tryPrint, 300); }
    else {
      imgs.forEach(function(img) {
        if (img.complete) { loaded++; if (loaded === total) setTimeout(tryPrint, 300); }
        else { img.onload = img.onerror = function() { loaded++; if (loaded === total) setTimeout(tryPrint, 300); }; }
      });
    }
    setTimeout(tryPrint, 3500);
  </script>
</body>
</html>`

    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:absolute;width:0;height:0;border:none;"
    document.body.appendChild(iframe)
    const frameDoc = iframe.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(html)
      frameDoc.close()
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe)
      setIsDownloading(false)
    }, 12000)
  }

  const handleAttachInvoice = async () => {
    if (!billRef.current) {
      message.error("Invoice element not found")
      return
    }

    setIsAttaching(true)
    try {
      const element = billRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 10000,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let finalHeight = imgHeight
      let finalWidth = imgWidth
      if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight
        finalHeight = pdfHeight
        finalWidth = imgWidth * ratio
      }

      const xPos = (pdfWidth - finalWidth) / 2
      pdf.addImage(imgData, "JPEG", xPos, 0, finalWidth, finalHeight, undefined, "FAST")

      const dataUri = pdf.output("datauristring")
      const base64 = dataUri.split(",")[1]
      const size = Math.round((base64.length * 3) / 4)
      const filename = `Invoice-${billNo}.pdf`

      if (onAttach) {
        onAttach({ name: filename, size, base64 })
        message.success(`Attached "${filename}" successfully!`)
      }
      onCancel()
    } catch (err: any) {
      console.error("Failed to generate PDF attachment:", err)
      message.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsAttaching(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          <span>Subscription Invoice</span>
        </div>
      }
      footer={
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">Bill No: {billNo}</span>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel}>Close</Button>
            <Button
              icon={<Download className="w-4 h-4 inline mr-1" />}
              loading={isDownloading}
              onClick={handleDownload}
            >
              Print / Preview
            </Button>
            {onAttach && (
              <Button
                type="primary"
                icon={<Paperclip className="w-4 h-4 inline mr-1" />}
                loading={isAttaching}
                onClick={handleAttachInvoice}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-medium"
              >
                {isAttaching ? "Generating PDF..." : (attachButtonText || "Attach to Email (PDF)")}
              </Button>
            )}
          </div>
        </div>
      }
      width={840}
      destroyOnHidden
    >
      <div className="space-y-4">

        {/* ── Editable Pricing & Payment Panel ── */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Edit Before Download</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300/80">
                <span className="text-xs text-amber-900 font-medium">Bank Info:</span>
                <Switch
                  size="small"
                  checked={showPaymentInfo}
                  onChange={setShowPaymentInfo}
                  checkedChildren="Show"
                  unCheckedChildren="Hide"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300/80">
                <span className="text-xs text-amber-900 font-medium">Signatures:</span>
                <Switch
                  size="small"
                  checked={showSignatures}
                  onChange={setShowSignatures}
                  checkedChildren="Show"
                  unCheckedChildren="Hide"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Subscription Description</label>
              <Input
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Installation Description</label>
              <Input
                value={installDesc}
                onChange={(e) => setInstallDesc(e.target.value)}
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Subscription Duration</label>
              <Select
                value={subDuration}
                onChange={handleDurationChange}
                className="w-full"
                size="small"
                options={[
                  { label: "1 Year", value: "1 Year" },
                  { label: "1 Month", value: "1 Month" },
                  { label: "3 Months", value: "3 Months" },
                  { label: "6 Months", value: "6 Months" },
                  { label: "2 Years", value: "2 Years" },
                  { label: "Custom", value: "Custom" },
                ]}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Coverage Period (Start – End)</label>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD MMM YYYY"
                className="w-full"
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Subscription Price (BDT)</label>
              <InputNumber
                value={subPrice}
                onChange={(v) => setSubPrice(v ?? 0)}
                min={0}
                step={500}
                formatter={(v) => `৳ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => Number(v?.replace(/৳\s?|(,*)/g, "")) as any}
                className="w-full"
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Installation Price (BDT) <span className="text-gray-400">— set 0 to show "Included"</span>
              </label>
              <InputNumber
                value={installPrice}
                onChange={(v) => setInstallPrice(v ?? 0)}
                min={0}
                step={500}
                formatter={(v) => `৳ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => Number(v?.replace(/৳\s?|(,*)/g, "")) as any}
                className="w-full"
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Discount (BDT)</label>
              <InputNumber
                value={discount}
                onChange={(v) => setDiscount(v ?? 0)}
                min={0}
                step={100}
                formatter={(v) => `৳ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => Number(v?.replace(/৳\s?|(,*)/g, "")) as any}
                className="w-full"
                size="small"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Due in days (from today)</label>
              <InputNumber
                value={dueInDays}
                onChange={(v) => setDueInDays(v ?? 7)}
                min={1}
                max={365}
                className="w-full"
                size="small"
              />
            </div>

            {/* ── Payment Settlement Inputs (Industry Standard) ── */}
            <div className="col-span-2 bg-amber-100/70 p-3 rounded-lg border border-amber-200 mt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-800" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Payment &amp; Settlement (Industry Standard)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="small"
                    type="dashed"
                    className="text-[11px] h-6 px-2.5 text-emerald-700 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 font-medium"
                    onClick={() => setPaidAmount(invoiceTotal)}
                  >
                    ✓ Paid in Full (৳{invoiceTotal.toLocaleString()})
                  </Button>
                  <Button
                    size="small"
                    type="dashed"
                    className="text-[11px] h-6 px-2.5 text-gray-600 border-gray-300 bg-white hover:bg-gray-50 font-medium"
                    onClick={() => setPaidAmount(0)}
                  >
                    Unpaid (৳0)
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">Paid Amount (BDT)</label>
                  <InputNumber
                    value={paidAmount}
                    onChange={(v) => setPaidAmount(v ?? 0)}
                    min={0}
                    step={500}
                    formatter={(v) => `৳ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => Number(v?.replace(/৳\s?|(,*)/g, "")) as any}
                    className="w-full"
                    size="small"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">Payment Method</label>
                  <Select
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    className="w-full"
                    size="small"
                    options={[
                      { label: "Bank Transfer", value: "Bank Transfer" },
                      { label: "bKash", value: "bKash" },
                      { label: "Nagad", value: "Nagad" },
                      { label: "Cash", value: "Cash" },
                      { label: "Card / Gateway", value: "Card / Gateway" },
                      { label: "Cheque", value: "Cheque" },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">Payment Date</label>
                  <DatePicker
                    value={paymentDate}
                    onChange={setPaymentDate}
                    format="DD MMM YYYY"
                    className="w-full"
                    size="small"
                  />
                </div>
              </div>
            </div>

            {showPaymentInfo && (
              <>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">A/C Holder Name</label>
                  <Input
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Bank Account No</label>
                  <Input
                    value={accNo}
                    onChange={(e) => setAccNo(e.target.value)}
                    size="small"
                  />
                </div>
              </>
            )}
          </div>

          {/* Live running summary */}
          <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-amber-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isPaidInFull
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isPartiallyPaid
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-sky-100 text-sky-800 border border-sky-300"
              }`}>
                {statusText}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-gray-600">
                Invoice Total: <span className="font-semibold text-gray-900">৳ {invoiceTotal.toLocaleString()}</span>
              </div>
              {safePaidAmount > 0 && (
                <div className="text-emerald-700">
                  Paid: <span className="font-semibold">৳ {safePaidAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Balance Due:</span>
                <span className={`text-base font-extrabold ${
                  isPaidInFull ? "text-emerald-600" : isPartiallyPaid ? "text-amber-600" : "text-sky-700"
                }`}>
                  ৳ {balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-0" />

        {/* ── Bill Preview (Mirrors Printed A4 Page) ── */}
        <div
          ref={billRef}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col justify-between shadow-sm"
          style={{ minHeight: "1050px", aspectRatio: "210 / 297" }}
        >
          {/* Main Top Section */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b-[2.5px] border-sky-500 bg-gradient-to-r from-sky-50/60 to-white">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/main_log_bgremoved.png" alt="TravelHisab" className="h-12 object-contain" crossOrigin="anonymous" />
                <div>
                  <div className="text-lg font-extrabold text-gray-900 leading-tight">Travel Hisab</div>
                  <div className="text-[9.5px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">{TRAVELHISAB.tagline}</div>
                  <div className="text-[10.5px] text-gray-600 mt-1 font-medium">{TRAVELHISAB.email} · {TRAVELHISAB.phone}</div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end max-w-xs">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border ${
                    isPaidInFull
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : isPartiallyPaid
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-sky-50 text-sky-700 border-sky-300"
                  }`}>
                    {statusText}
                  </span>
                  <div className="text-3xl font-black text-sky-500 uppercase tracking-[0.15em] leading-none">Invoice</div>
                </div>
                <div className="text-[9px] text-gray-500 space-y-0.5 leading-snug">
                  <div><span className="font-semibold text-gray-700">Dhaka Office:</span> {TRAVELHISAB.dhakaOffice}</div>
                  <div><span className="font-semibold text-gray-700">Corporate Office:</span> {TRAVELHISAB.corporateOffice}</div>
                </div>
                <div className="text-[9.5px] text-sky-600 font-semibold mt-1">{TRAVELHISAB.website}</div>
              </div>
            </div>

            {/* Bill To + Invoice Details */}
            <div className="grid grid-cols-2 gap-5 p-5">
              {/* Bill To */}
              <div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</div>
                <div className="bg-gray-50 rounded-lg border-l-4 border-sky-500 p-4">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={`${company.name} logo`} className="h-9 object-contain mb-3" crossOrigin="anonymous" />
                  ) : (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-sky-100 p-1.5 rounded"><Building2 className="w-4 h-4 text-sky-600" /></div>
                    </div>
                  )}
                  <div className="font-bold text-gray-900">{company.name}</div>
                  {company.address && (
                    <div className="flex items-start gap-1.5 mt-1.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{company.address}{company.address2 ? `, ${company.address2}` : ""}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span>{company.email}</span>
                  </div>
                  {company.mobileNumber && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{company.mobileNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Invoice Details</div>
                <div className="bg-sky-50/60 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Bill No</span>
                    <span className="font-semibold text-gray-800">{billNo}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Issue Date</span>
                    <span className="font-semibold text-gray-800">{issueDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-semibold text-gray-800">{dueDate}</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider border ${
                      isPaidInFull
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : isPartiallyPaid
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-sky-50 text-sky-700 border-sky-300"
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  {safePaidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-semibold text-gray-800">{paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Payment Date</span>
                        <span className="font-semibold text-gray-800">{paidDateStr}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="px-5 pb-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-sky-600 text-white" style={{ height: "36px" }}>
                    <th className="px-3 text-left font-semibold w-8 text-xs" style={{ verticalAlign: "middle", height: "36px", paddingTop: 0, paddingBottom: 0 }}>
                      <div className="flex items-center h-full">#</div>
                    </th>
                    <th className="px-3 text-left font-semibold text-xs" style={{ verticalAlign: "middle", height: "36px", paddingTop: 0, paddingBottom: 0 }}>
                      <div className="flex items-center h-full">Description</div>
                    </th>
                    <th className="px-3 text-center font-semibold w-12 text-xs" style={{ verticalAlign: "middle", height: "36px", paddingTop: 0, paddingBottom: 0 }}>
                      <div className="flex items-center justify-center h-full">Qty</div>
                    </th>
                    <th className="px-3 text-right font-semibold w-28 text-xs" style={{ verticalAlign: "middle", height: "36px", paddingTop: 0, paddingBottom: 0 }}>
                      <div className="flex items-center justify-end h-full">Unit Price</div>
                    </th>
                    <th className="px-3 text-right font-semibold w-28 text-xs" style={{ verticalAlign: "middle", height: "36px", paddingTop: 0, paddingBottom: 0 }}>
                      <div className="flex items-center justify-end h-full">Amount</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-3 text-gray-400">01</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-800">{subDesc}</div>
                      {periodLabel && <div className="text-gray-400 text-[10px] mt-0.5">{periodLabel}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">1</td>
                    <td className="py-3 px-3 text-right">৳ {subPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-semibold">৳ {subPrice.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="py-3 px-3 text-gray-400">02</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-800">{installDesc}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">One-time setup & onboarding support</div>
                    </td>
                    <td className="py-3 px-3 text-center">1</td>
                    <td className="py-3 px-3 text-right">
                      {installPrice > 0 ? `৳ ${installPrice.toLocaleString()}` : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      {installPrice > 0 ? `৳ ${installPrice.toLocaleString()}` : <span className="text-green-600">Included</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end px-5 py-4">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sub Total</span>
                  <span className="font-medium text-gray-800">৳ {subTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Discount</span>
                    <span className="font-medium text-red-500">− ৳ {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-semibold text-gray-800 pt-1 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>৳ {invoiceTotal.toLocaleString()}</span>
                </div>
                {safePaidAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                    <span>Amount Paid</span>
                    <span>৳ {safePaidAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className={`flex justify-between items-center text-white rounded-md px-3 py-2 mt-1 shadow-sm ${
                  isPaidInFull ? "bg-emerald-600" : isPartiallyPaid ? "bg-amber-600" : "bg-sky-600"
                }`}>
                  <span className="font-bold text-xs">
                    {isPaidInFull ? "Balance Due (Paid in Full)" : "Balance Due"}
                  </span>
                  <span className="font-extrabold text-base">৳ {balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div> {/* Close Main Top Section (.flex-1) */}

          {/* Bottom Section - pinned to the bottom of the A4 invoice */}
          <div className="mt-auto">
            {/* Payment & Banking Box */}
            {showPaymentInfo && (
              isPaidInFull ? (
                <div className="mx-5 mb-4 bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5">
                  <div className="flex justify-between items-center pb-2 mb-2.5 border-b border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Payment Settlement – Paid in Full
                    </span>
                    <span className="text-[9.5px] text-emerald-600 font-semibold">
                      Ref: <span className="font-bold text-emerald-800">{billNo}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10.5px] text-emerald-900">
                    <div className="space-y-1">
                      <div><span className="font-semibold text-emerald-700">Settlement Status:</span> <span className="font-bold text-emerald-600">✓ Fully Settled</span></div>
                      <div><span className="font-semibold text-emerald-700">Payment Method:</span> {paymentMethod}</div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="font-semibold text-emerald-700">Amount Received:</span> <span className="font-bold">৳ {safePaidAmount.toLocaleString()}</span></div>
                      <div><span className="font-semibold text-emerald-700">Payment Date:</span> {paidDateStr}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-dashed border-emerald-200 text-[9.5px] text-emerald-700">
                    Thank you for choosing Travel Hisab! Payment has been received in full. For queries contact{" "}
                    <span className="text-emerald-800 font-medium">{TRAVELHISAB.email}</span> or call{" "}
                    <span className="text-emerald-800 font-medium">{TRAVELHISAB.phone}</span>.
                  </div>
                </div>
              ) : (
                <div className="mx-5 mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="flex justify-between items-center pb-2 mb-2.5 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Payment Details – Bank Transfer</span>
                    <span className="text-[9.5px] text-slate-500">Ref: <span className="font-semibold text-slate-800">{billNo}</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10.5px] text-slate-600">
                    <div className="space-y-1">
                      <div><span className="font-semibold text-slate-800">Bank Name:</span> {bankName}</div>
                      <div><span className="font-semibold text-slate-800">A/C Name:</span> {accName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">Account No:</span>
                        <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded text-[11px]">{accNo}</span>
                      </div>
                      <div><span className="font-semibold text-slate-800">Branch:</span> {branch}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 text-[9.5px] text-slate-500">
                    {safePaidAmount > 0 
                      ? `৳ ${safePaidAmount.toLocaleString()} received via ${paymentMethod}. Please transfer the remaining balance of ৳ ${balanceDue.toLocaleString()} via BEFTN / NPSB / Direct Deposit within the due date.`
                      : `Please transfer the total amount via BEFTN / NPSB / Direct Deposit within the due date.`}{" "}
                    For queries contact <span className="text-sky-600 font-medium">{TRAVELHISAB.email}</span> or call{" "}
                    <span className="text-sky-600 font-medium">{TRAVELHISAB.phone}</span>.
                  </div>
                </div>
              )
            )}

            {/* Signatures */}
            {showSignatures && (
              <div className="flex justify-between items-end px-5 pb-3 pt-3 border-t border-dashed border-gray-200">
                <div className="text-center">
                  <div className="w-24 border-t border-gray-400 mb-1" />
                  <div className="text-[9.5px] text-gray-500 font-semibold">Customer Signature</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sky-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Thank you for choosing Travel Hisab!
                </div>
                <div className="text-center">
                  <div className="w-24 border-t border-gray-400 mb-1" />
                  <div className="text-[9.5px] text-gray-500 font-semibold">Authorized by Travel Hisab</div>
                </div>
              </div>
            )}

            {/* Bottom Brand Line */}
            <div className="flex justify-between items-center px-5 py-2.5 border-t border-gray-100 bg-gray-50/70 text-[9.5px] text-gray-400">
              <div>Travel Hisab — A wing of <span className="font-semibold text-sky-600">mybdsoft.com</span></div>
              <div>travelhisab.com</div>
            </div>
          </div> {/* Close Bottom Section (.mt-auto) */}
        </div> {/* Close billRef */}
      </div>
    </Modal>
  )
}
