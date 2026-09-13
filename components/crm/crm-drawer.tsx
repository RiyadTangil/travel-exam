"use client"

import { useEffect, useState } from "react"
import { Drawer, Form, Input, Select, Row, Col, DatePicker, InputNumber } from "antd"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, Plane, Compass, Clock, BellRing } from "lucide-react"
import dayjs from "dayjs"
import { UserSelection } from "@/components/shared/user-selection"

export type LeadStage = "NEW" | "QUALIFIED" | "QUOTED" | "FOLLOWUP" | "WON" | "LOST"
export type LeadPriority = "HIGH" | "MEDIUM" | "LOW"
export type ServiceType = "AIR_TICKET" | "VISA" | "UMRAH" | "HOLIDAY_PACKAGE" | "HOTEL" | "CUSTOM_TOUR" | "TRANSPORT" | "OTHERS"
export type LeadSource = "FACEBOOK" | "WHATSAPP" | "WALK_IN" | "REFERRAL" | "WEBSITE" | "B2B_AGENT" | "PHONE_CALL"

export type CRMLead = {
  id: string
  clientName: string
  mobile: string
  email?: string
  address?: string
  passportNo?: string
  passportExpiryDate?: string
  visaExpiryDate?: string
  serviceType: ServiceType
  destination: string
  paxAdults: number
  paxChildren: number
  estimatedValue: number
  stage: LeadStage
  priority: LeadPriority
  source: LeadSource
  assignedTo: string
  assignedToId?: string
  travelDate?: string
  returnDate?: string
  nextFollowUp?: string
  autoRemindVisaExpiry?: boolean
  autoRemindPassportExpiry?: boolean
  autoRemindPreDeparture?: boolean
  notes?: string
  createdAt: string
  lastContactedAt?: string
}

export type CRMLeadDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  lead?: CRMLead | null
  employees?: Array<{ id: string; name: string; designation?: string }>
  onSubmit?: (lead: Partial<CRMLead>) => void
}

export const SERVICE_TYPE_OPTIONS: Array<{ value: ServiceType; label: string; icon: string }> = [
  { value: "AIR_TICKET",      label: "Air Ticket",        icon: "✈️" },
  { value: "VISA",            label: "Visa Processing",   icon: "📄" },
  { value: "UMRAH",           label: "Umrah Package",     icon: "🕋" },
  { value: "HOLIDAY_PACKAGE", label: "Holiday Package",   icon: "🏝️" },
  { value: "HOTEL",           label: "Hotel Booking",     icon: "🏨" },
  { value: "CUSTOM_TOUR",     label: "Custom Tour",       icon: "🗺️" },
  { value: "TRANSPORT",       label: "Transport Service", icon: "🚌" },
  { value: "OTHERS",          label: "Others",            icon: "✨" },
]

export const STAGE_OPTIONS: Array<{ value: LeadStage; label: string; color: string }> = [
  { value: "NEW",      label: "New Lead",           color: "blue"   },
  { value: "QUALIFIED",label: "Qualified",          color: "cyan"   },
  { value: "QUOTED",   label: "Quotation Sent",     color: "orange" },
  { value: "FOLLOWUP", label: "Follow-up Pending",  color: "purple" },
  { value: "WON",      label: "Won / Booked",       color: "green"  },
  { value: "LOST",     label: "Lost / Closed",      color: "red"    },
]

export const SOURCE_OPTIONS: Array<{ value: LeadSource; label: string }> = [
  { value: "WALK_IN",    label: "🚶 Walk-in Visitor"        },
  { value: "WHATSAPP",   label: "💬 WhatsApp Enquiry"       },
  { value: "FACEBOOK",   label: "📘 Social Media (FB/IG)"   },
  { value: "PHONE_CALL", label: "📞 Phone Call"              },
  { value: "REFERRAL",   label: "🤝 Client Referral"        },
  { value: "WEBSITE",    label: "🌐 Website Form"            },
  { value: "B2B_AGENT",  label: "🏢 Sub-Agent / B2B"        },
]

// Section header component for consistency
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    sky:    "bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-100 text-sky-900",
    slate:  "bg-gradient-to-r from-slate-50 to-sky-50 border-slate-200 text-slate-700",
    purple: "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100 text-purple-900",
  }
  const iconMap: Record<string, string> = {
    sky:    "bg-sky-600",
    slate:  "bg-slate-600",
    purple: "bg-purple-600",
  }
  return (
    <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border ${colorMap[color]}`}>
      <div className={`w-6 h-6 rounded-lg ${iconMap[color]} flex items-center justify-center flex-shrink-0 text-white`}>
        {icon}
      </div>
      <h4 className="text-xs font-bold uppercase tracking-wider">{label}</h4>
    </div>
  )
}

export function CRMLeadDrawer({
  open,
  onOpenChange,
  mode,
  lead,
  employees = [],
  onSubmit,
}: CRMLeadDrawerProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const isView = mode === "view"
  const isEdit = mode === "edit"

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }
    if ((isView || isEdit) && lead) {
      form.setFieldsValue({
        clientName:  lead.clientName,
        mobile:      lead.mobile,
        email:       lead.email,
        serviceType: lead.serviceType,
        destination: lead.destination,
        paxAdults:   lead.paxAdults ?? 1,
        paxChildren: lead.paxChildren ?? 0,
        travelDate:  lead.travelDate ? dayjs(lead.travelDate) : null,
        estimatedValue: lead.estimatedValue,
        stage:       lead.stage,
        priority:    lead.priority,
        source:      lead.source,
        assignedTo:  lead.assignedToId || lead.assignedTo,
        nextFollowUp: lead.nextFollowUp ? dayjs(lead.nextFollowUp) : null,
        notes:       lead.notes,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        stage:       "NEW",
        priority:    "HIGH",
        source:      "WALK_IN",
        serviceType: "AIR_TICKET",
        paxAdults:   1,
        paxChildren: 0,
        assignedTo:  employees[0]?.name || undefined,
        nextFollowUp: dayjs().add(2, "hour"),
      })
    }
  }, [open, isView, isEdit, lead, form, employees])

  const handleSubmit = async () => {
    if (isView) return
    try {
      const values = await form.validateFields()
      setLoading(true)
      const payload: Partial<CRMLead> = {
        ...values,
        travelDate:   values.travelDate   ? values.travelDate.format("YYYY-MM-DD")       : undefined,
        nextFollowUp: values.nextFollowUp  ? values.nextFollowUp.format("YYYY-MM-DD HH:mm") : undefined,
      }
      if (onSubmit) await onSubmit(payload)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isNew = !isEdit && !isView
  const title = isView ? "Lead Details" : isEdit ? "Edit Lead" : "New Enquiry / Walk-in"
  const subtitle = isNew
    ? "Capture quick client enquiry details & schedule follow-up"
    : isEdit
    ? "Update lead details, service & follow-up schedule"
    : "Lead overview"

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Compass className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs text-gray-400 font-normal">{subtitle}</p>
          </div>
        </div>
      }
      placement="right"
      width={600}
      onClose={() => onOpenChange(false)}
      open={open}
      destroyOnHidden
      extra={
        !isView && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={loading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              loading={loading}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-none shadow-md"
            >
              {isEdit ? "Save Changes" : "Create Lead"}
            </Button>
          </div>
        )
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} colon={false} disabled={isView}>

        {/* ── Section 1: Client Contact ── */}
        <div className="mb-5">
          <SectionHeader icon={<User className="h-3.5 w-3.5" />} label="Client Contact" color="sky" />
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="clientName" label="Full Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="e.g. Tanvir Ahmed" prefix={<User className="h-3.5 w-3.5 text-gray-400" />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="mobile" label="Mobile / WhatsApp" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="01xxxxxxxxx" prefix={<Phone className="h-3.5 w-3.5 text-gray-400" />} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="email" label="Email (Optional)">
                <Input placeholder="client@example.com" prefix={<Mail className="h-3.5 w-3.5 text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ── Section 2: Travel & Service ── */}
        <div className="mb-5">
          <SectionHeader icon={<Plane className="h-3.5 w-3.5" />} label="Travel & Service" color="slate" />
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="serviceType" label="Service Required" rules={[{ required: true, message: "Required" }]}>
                <Select
                  placeholder="Select service"
                  options={SERVICE_TYPE_OPTIONS.map((s) => ({ value: s.value, label: `${s.icon} ${s.label}` }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="destination" label="Destination" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="e.g. Dubai / Bangkok / Makkah" prefix={<Compass className="h-3.5 w-3.5 text-gray-400" />} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="paxAdults" label="Adults">
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="paxChildren" label="Children">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="travelDate" label="Departure Date">
                <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label="Remarks / Requirements">
                <Input.TextArea
                  rows={2}
                  placeholder="e.g. Client wants 5-star hotel. Budget flexible. Passport copy collected."
                  className="resize-none"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ── Section 3: CRM Assignment & Follow-up ── */}
        <div className="mb-4">
          <SectionHeader icon={<Clock className="h-3.5 w-3.5" />} label="Pipeline & Follow-up" color="purple" />
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="estimatedValue"
                label="Est. Deal Value (BDT)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(v) => `৳ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/৳\s?|(,*)/g, "")}
                  placeholder="e.g. 150000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="stage" label="Pipeline Stage" rules={[{ required: true }]}>
                <Select options={STAGE_OPTIONS.map((st) => ({ value: st.value, label: st.label }))} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="priority" label="Priority">
                <Select
                  options={[
                    { value: "HIGH",   label: "🔥 High / Urgent" },
                    { value: "MEDIUM", label: "⚡ Medium"         },
                    { value: "LOW",    label: "🔹 Low"            },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="source" label="Enquiry Channel">
                <Select options={SOURCE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="assignedTo" label="Assigned User" rules={[{ required: true }]}>
                <UserSelection placeholder="Select user" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="nextFollowUp"
                label="Follow-up Date & Time"
                extra={isNew ? "Defaults to 2 hours from now for walk-in clients." : undefined}
              >
                <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" placeholder="Select date & time" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Pre-departure reminder hint */}
        {!isView && (
          <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700">
            <BellRing className="h-3.5 w-3.5 text-sky-500 mt-0.5 flex-shrink-0" />
            <span>
              <span className="font-bold">Auto Reminders:</span> System will automatically alert the assigned staff
              24h before the departure date to send PNR, e-ticket &amp; web check-in info to the passenger.
            </span>
          </div>
        )}

      </Form>
    </Drawer>
  )
}
