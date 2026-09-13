"use client"

import { useState } from "react"
import { Modal, Form, Input, Select, DatePicker } from "antd"
import { Phone, MessageSquare, User } from "lucide-react"
import { CRMLead } from "./crm-drawer"
import dayjs from "dayjs"
import { useMutationApi } from "@/hooks/api/useMutationApi"
import { ENDPOINTS } from "@/lib/api/api-endpoints"
import { queryKeys } from "@/hooks/api/queryKeys"

export type LogActivityModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: CRMLead | null
  onSave?: (activity: any) => void
}

const ACTIVITY_TYPES = [
  { value: "CALL",        label: "📞 Phone Call" },
  { value: "WHATSAPP",    label: "💬 WhatsApp Message" },
  { value: "QUOTE_SENT",  label: "📩 Quotation / Fare Sent" },
  { value: "MEETING",     label: "🤝 In-Office Meeting" },
  { value: "NOTE",        label: "📝 General Note" },
]

const OUTCOMES = [
  { value: "POSITIVE",    label: "✅ Positive — Client Interested" },
  { value: "NEUTRAL",     label: "⏳ Neutral — Needs More Time" },
  { value: "DECLINED",    label: "❌ Declined — Not Interested" },
  { value: "BOOKED",      label: "🎉 Booked — Deal Confirmed!" },
  { value: "CALLBACK",    label: "🔁 Requested Callback" },
]

export function LogActivityModal({
  open,
  onOpenChange,
  lead,
  onSave,
}: LogActivityModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const updateMutation = useMutationApi(ENDPOINTS.CRM.LEADS.URL, {
    method: "PUT",
    invalidateKeys: [
      [...queryKeys.lists(), ENDPOINTS.CRM.LEADS.KEY],
      [...queryKeys.details(), ENDPOINTS.CRM.METRICS.KEY],
    ],
    successMessage: "Contact activity logged successfully",
  })

  const handleSubmit = async () => {
    if (!lead) return
    try {
      const values = await form.validateFields()
      setLoading(true)

      const typeLabel = ACTIVITY_TYPES.find((a) => a.value === values.type)?.label || values.type
      const outcomeLabel = OUTCOMES.find((o) => o.value === values.outcome)?.label || values.outcome
      const timeStr = dayjs().format("MMM D, YYYY h:mm A")
      const logEntry = `[${timeStr}] ${typeLabel} (${outcomeLabel}): ${values.summary}`

      const updatedNotes = lead.notes ? `${lead.notes}\n${logEntry}` : logEntry

      const payload: any = {
        id: lead.id,
        notes: updatedNotes,
      }

      if (values.nextFollowUp) {
        payload.nextFollowUp = values.nextFollowUp.format("YYYY-MM-DD HH:mm")
      }

      if (values.outcome === "BOOKED") {
        payload.stage = "WON"
      } else if (values.outcome === "DECLINED") {
        payload.stage = "LOST"
      }

      await updateMutation.mutateAsync(payload)
      if (onSave) onSave(values)
      form.resetFields()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Save Activity"
      okButtonProps={{ className: "bg-sky-600 hover:bg-sky-700 border-none" }}
      title={
        <div className="flex items-center gap-2 pb-1">
          <span className="text-sm font-bold text-slate-800">Log Contact Activity</span>
        </div>
      }
      destroyOnClose
      width={500}
    >
      {/* Client Context Banner */}
      {lead && (
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-xl px-4 py-3 mb-5 -mx-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {lead.clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{lead.clientName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {lead.mobile}
                <span className="mx-1">·</span>
                {lead.destination}
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            onClick={() =>
              window.open(
                `https://wa.me/88${lead.mobile}?text=${encodeURIComponent(
                  `Hello ${lead.clientName}, regarding your travel enquiry for ${lead.destination}...`
                )}`
              )
            }
          >
            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
          </button>
        </div>
      )}

      <Form form={form} layout="vertical" className="space-y-1">
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="type"
            label="Activity Type"
            initialValue="CALL"
            rules={[{ required: true }]}
            className="mb-3"
          >
            <Select options={ACTIVITY_TYPES} />
          </Form.Item>

          <Form.Item
            name="outcome"
            label="Outcome / Result"
            initialValue="POSITIVE"
            rules={[{ required: true }]}
            className="mb-3"
          >
            <Select options={OUTCOMES} />
          </Form.Item>
        </div>

        <Form.Item
          name="summary"
          label="Activity Summary / Call Notes"
          rules={[{ required: true, message: "Please enter call summary" }]}
          className="mb-3"
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g. Discussed Air Arabia flights for 3 pax to Sharjah. Quoted ৳ 145,000. Customer promised to confirm by Thursday."
            className="resize-none"
          />
        </Form.Item>

        <Form.Item
          name="nextFollowUp"
          label="Schedule Next Follow-up (Optional)"
          className="mb-0"
        >
          <DatePicker
            showTime
            className="w-full"
            format="YYYY-MM-DD HH:mm"
            placeholder="Select date & time for next contact"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
