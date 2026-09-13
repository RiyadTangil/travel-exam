"use client"

import { useState, useEffect } from "react"
import { Table, Tag, Typography, Tooltip, Modal, Form, Input, message, Select, DatePicker, Timeline, Checkbox, Space, Button as AntButton } from "antd"
import { Building2, Mail, Phone, Globe, MapPin, Calendar, CheckCircle2, MessageSquare, Send, Plus, Clock, Facebook, Trash2, Copy } from "lucide-react"
import { AdminFilterToolbar } from "@/components/admin/admin-filter-toolbar"
import { StringDateRange } from "@/components/shared/date-range-with-presets"
import { useList } from "@/hooks/api/useList"
import { useMutationApi } from "@/hooks/api/useMutationApi"
import { useDebounce } from "@/hooks/use-debounce"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { CampaignTemplateModal } from "@/components/admin/registered-agencies/campaign-template-modal"
import { BulkCampaignActionBar } from "@/components/admin/registered-agencies/bulk-campaign-action-bar"

const { Title, Text } = Typography

const QUICK_NOTE_PRESETS = [
  { label: "Not Now", note: "Not Now", status: "Less Interest", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300" },
  { label: "Use Soft", note: "Use Soft", status: "Called - Not Interested", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300" },
  { label: "Demo Sent", note: "Demo Sent", status: "Meeting Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300" },
  { label: "Want Office Meet", note: "Want Office Meet", status: "Meeting Scheduled", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300" },
]

export default function RegisteredAgenciesPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [dateRange, setDateRange] = useState<StringDateRange | undefined>()
  const [listFilter, setListFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>()
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>("sent")
  const debouncedSearch = useDebounce(search, 500)


  // Reset pagination to page 1 whenever any filter or search query changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, listFilter, statusFilter, selectedCampaignId, campaignStatusFilter, dateRange])

  const handleCreateCampaignClick = () => {
    setIsMessageModalOpen(true)
  }

  const [narrowViewport, setNarrowViewport] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const apply = () => setNarrowViewport(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const { data: campaignsRes, refetch: refetchCampaigns } = useList<any>("marketing-campaigns-list", "/api/admin/marketing-campaigns")
  const campaignsList = campaignsRes?.data || []

  // FB Page Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()

  // Add Agency Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addForm] = Form.useForm()

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedHistoryAgency, setSelectedHistoryAgency] = useState<any>(null)
  const [noteForm] = Form.useForm()

  const { data: historyRes, refetch: refetchHistory, isFetching: isLoadingHistory } = useList<any>(
    `history-${selectedHistoryAgency?.id}`,
    `/api/admin/registered-agencies/${selectedHistoryAgency?.id}/history`,
    {},
    {
      enabled: !!selectedHistoryAgency
    }
  )

  const historyData = historyRes?.data?.history || []

  const openHistoryModal = (agency: any) => {
    setSelectedHistoryAgency(agency)
    setIsHistoryModalOpen(true)
  }

  const addNoteMutation = useMutationApi<any>(`/api/admin/registered-agencies/${selectedHistoryAgency?.id}/history`, {
    invalidateKeys: [["registered-agencies"]],
    onSuccess: () => {
      noteForm.resetFields()
      refetchHistory()
      setIsHistoryModalOpen(false)
    }
  })

  const handleAddNote = (values: any) => {
    if (!selectedHistoryAgency) return
    addNoteMutation.mutate(values)
  }

  const handleQuickPreset = (preset: { note: string; status: string }) => {
    if (addNoteMutation.isPending || !selectedHistoryAgency) return
    noteForm.setFieldsValue({
      note: preset.note,
      status: preset.status,
    })
    handleAddNote({
      note: preset.note,
      status: preset.status,
    })
  }

  // Message Campaign State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isSending, setIsSending] = useState(false)

  const insertVariable = (variable: string) => {
    setMessageBody(prev => prev + variable)
  }

  const formatMessage = (template: string, record: any) => {
    if (!template) return ""
    const [name, license] = (record?.agency_name_license || "").split('\n')
    let formatted = template
    formatted = formatted.replace(/{{agency_name}}/g, name || "")
    formatted = formatted.replace(/{{license}}/g, license ? license.replace('License: ', '').trim() : "")
    return formatted.trim()
  }

  const formatWhatsAppNumber = (phoneStr: string) => {
    let number = phoneStr.replace(/\D/g, '')
    // Add country code if it looks like a local BD number
    if (number.startsWith('01') && number.length === 11) {
      number = '88' + number
    }
    return number
  }

  const getWhatsAppUrl = (number: string, text: string) => {
    return text
      ? `https://web.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`
      : `https://web.whatsapp.com/send/?phone=${number}&type=phone_number&app_absent=0`;
  }

  const handlePhoneClick = (e: React.MouseEvent, phoneStr: string) => {
    e.stopPropagation();
    const cleanNumber = phoneStr.trim();
    const dialNumber = cleanNumber.replace(/[^0-9+]/g, "");

    const isPhoneDevice = typeof window !== "undefined" && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 768px)").matches ||
      ("ontouchstart" in window && window.innerWidth <= 1024)
    );

    if (isPhoneDevice) {
      window.location.href = `tel:${dialNumber}`;
    } else {
      navigator.clipboard.writeText(cleanNumber)
        .then(() => {
          message.success(`Phone number ${cleanNumber} copied to clipboard!`);
        })
        .catch(() => {
          window.location.href = `tel:${dialNumber}`;
        });
    }
  }

  const handleCopyOnly = (e: React.MouseEvent, phoneStr: string) => {
    e.stopPropagation();
    e.preventDefault();
    const cleanNumber = phoneStr.trim();
    navigator.clipboard.writeText(cleanNumber)
      .then(() => {
        message.success(`Phone number ${cleanNumber} copied to clipboard!`);
      })
      .catch(() => {});
  }

  const handleSendWhatsAppManual = async (record: any) => {
    if (!messageBody) {
      message.error("Please draft a campaign template first using 'Create Campaign' button.")
      return
    }

    const formatted = formatMessage(messageBody, record)

    // 1. Copy to clipboard
    try {
      await navigator.clipboard.writeText(formatted)
      message.success("Campaign message copied to clipboard!")
    } catch (err) {
      message.error("Failed to copy message to clipboard")
    }

    // 2. Log campaign to backend
    try {
      const res = await fetch(`/api/admin/marketing-campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "whatsapp",
          messageBody: messageBody,
          agencyIds: [record.id]
        })
      })
      if (res.ok) {
        message.success("Communication logged automatically!")
        refetchCampaigns()
      } else {
        message.error("Failed to log campaign record")
      }
    } catch (e) {
      message.error("Failed to log campaign record")
    }
  }

  const handleSendSingleEmail = (e: React.MouseEvent, emailStr: string, record: any) => {
    e.stopPropagation();
    const match = emailStr.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
    const exactEmail = match ? match[0] : emailStr.trim()

    if (!messageSubject || !messageBody) {
      // Fallback to standard mailto if no template drafted
      window.location.href = `mailto:${exactEmail}`
      return
    }

    Modal.confirm({
      title: 'Send Email',
      content: `Are you sure you want to send an email to ${exactEmail}?`,
      okText: 'Yes, Send',
      cancelText: 'Cancel',
      onOk: async () => {
        const formatted = formatMessage(messageBody, record)
        const formattedSubject = formatMessage(messageSubject, record)
        setIsSending(true)
        try {
          const res = await fetch("/api/admin/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipients: [exactEmail],
              subject: formattedSubject,
              html: formatted.replace(/\n/g, '<br>')
            }),
          })
          if (res.ok) {
            message.success("Email sent to " + exactEmail)
            try {
              const logRes = await fetch(`/api/admin/marketing-campaigns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "email",
                  subject: messageSubject,
                  messageBody: messageBody,
                  agencyIds: [record.id]
                })
              })
              if (logRes.ok) {
                refetchCampaigns()
              }
            } catch (e) {
              console.error("Failed to log campaign record", e)
            }
          } else {
            message.error("Failed to send email")
          }
        } catch (e) {
          message.error("Error sending email")
        } finally {
          setIsSending(false)
        }
      }
    })
  }



  const handleOpenModal = (record: any) => {
    setSelectedAgency(record)
    form.setFieldsValue({ 
      facebook_page: record.facebook_page || "",
      website: record.website || "",
      trabillExp: record.trabillExp ? dayjs(record.trabillExp) : null,
      emails: record.emails?.length ? record.emails.map((e: any) => ({ ...e, isDefault: e.isDefault === 1 })) : [],
      phones: record.phones?.length ? record.phones.map((p: any) => ({ ...p, isDefault: p.isDefault === 1 })) : []
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAgency(null)
    form.resetFields()
  }

  const handleUpdateAgency = async (values: any) => {
    if (!selectedAgency) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/registered-agencies/${selectedAgency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facebook_page: values.facebook_page,
          website: values.website,
          trabillExp: values.trabillExp ? values.trabillExp.format("YYYY-MM-DD") : undefined,
          emails: values.emails?.map((e: any) => ({ ...e, isDefault: e.isDefault ? 1 : 0 })) || [],
          phones: values.phones?.map((p: any) => ({ ...p, isDefault: p.isDefault ? 1 : 0 })) || []
        }),
      })

      const result = await res.json()
      if (result.success) {
        message.success("Agency updated successfully")
        handleCloseModal()
        refetch() // Refresh the table
      } else {
        message.error(result.message || "Failed to update agency")
      }
    } catch (error) {
      console.error(error)
      message.error("Failed to update agency")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAgencyMutation = useMutationApi<any>(`/api/admin/registered-agencies`, {
    onSuccess: () => {
      setIsAddModalOpen(false)
      addForm.resetFields()
      refetch()
    }
  })

  const handleAddAgency = (values: any) => {
    addAgencyMutation.mutate({
      name: values.name,
      license: values.license,
      email: values.email,
      phone: values.phone,
      website: values.website,
      address: values.address,
      expiry: values.expiry ? values.expiry.format("YYYY-MM-DD") : undefined,
    })
  }

  // Fetch Registered Agencies
  const { data, isLoading, refetch } = useList<any>("registered-agencies", "/api/admin/registered-agencies", {
    page,
    limit,
    search: debouncedSearch,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
    isNew: listFilter === "new" ? "1" : undefined,
    hasFb: listFilter === "fb_available" ? "1" : undefined,
    isTrabill: listFilter === "trabill_user" ? "1" : undefined,
    campaignId: selectedCampaignId,
    campaignFilterType: selectedCampaignId ? campaignStatusFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  const rows = data?.data?.items || []
  const total = data?.data?.total || 0

  const columns = [
    {
      title: "SL",
      key: "serial_no",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) => <span className="font-mono text-slate-500">{(page - 1) * limit + index + 1}</span>,
      responsive: ["sm"] as any,
    },
     
    {
      title: "Business Address",
      dataIndex: "business_address_en",
      key: "address",
      width: 250,
      responsive: ["md"] as any,
      render: (text: string) => (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
          <Text className="text-slate-600 text-sm italic">
            {text?.replace(/\n+/g, ' ').trim()}
          </Text>
        </div>
      ),
    },
    {
      title: "Agency & License",
      dataIndex: "agency_name_license",
      key: "agency_name_license",
      width: 300,
      render: (text: string) => {
        const [name, license] = text.split('\n')
        return (
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-lg mt-1">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-slate-800 leading-tight mb-1">{name}</div>
              {license && (
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  License: {license}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
   
    {
      title: "Contact Information",
      dataIndex: "agency_email_number_website",
      key: "contact",
      width: 250,
      render: (text: string, record: any) => {
        const hasStructuredEmails = record.emails && record.emails.length > 0;
        const hasStructuredPhones = record.phones && record.phones.length > 0;
        const fbPageUrl = record.facebook_page || record.fb_page;
        const websiteUrl = record.website;

        const legacyParts = text?.split('\n').filter(Boolean) || [];
        const legacyEmails = legacyParts.filter(p => p.includes('@'));
        const legacyPhones = legacyParts.filter(p => !p.includes('@') && !p.includes('www.') && !p.includes('http') && /[\d+]/.test(p));

        return (
          <div className="space-y-1.5">
            {/* Emails */}
            {hasStructuredEmails ? (
              record.emails.map((emailItem: any, idx: number) => (
                <div key={`e-${idx}`} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-blue-600 group transition-colors" onClick={(e) => handleSendSingleEmail(e, emailItem.address, record)}>
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  <span className={`truncate max-w-[200px] ${emailItem.isDefault === 1 ? 'font-semibold text-blue-700' : ''}`} title={messageBody ? `Send drafted email to ${emailItem.address}` : `Email ${emailItem.address}`}>
                    {emailItem.address}
                  </span>
                  {emailItem.isDefault === 1 && <Tag color="blue" className="text-[10px] py-0 leading-tight border-0 ml-1">Default</Tag>}
                </div>
              ))
            ) : (
              legacyEmails.map((emailStr: string, idx: number) => (
                <div key={`le-${idx}`} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-blue-600 group transition-colors" onClick={(e) => handleSendSingleEmail(e, emailStr, record)}>
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  <span className="truncate max-w-[200px]" title={messageBody ? `Send drafted email to ${emailStr}` : `Email ${emailStr}`}>{emailStr}</span>
                </div>
              ))
            )}

            {/* Phones */}
            {hasStructuredPhones ? (
              record.phones.map((phoneItem: any, idx: number) => (
                <div key={`p-${idx}`} className="flex items-center gap-1.5 text-sm text-slate-600 group transition-colors">
                  <a
                    href={`tel:${phoneItem.number.replace(/[^0-9+]/g, "")}`}
                    onClick={(e) => handlePhoneClick(e, phoneItem.number)}
                    className="flex items-center gap-2 hover:text-green-600 truncate max-w-[190px] cursor-pointer"
                    title="Click to call on phone, or copy on desktop"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-green-600 shrink-0" />
                    <span className={`truncate ${phoneItem.isDefault === 1 ? 'font-semibold text-green-700' : ''}`}>
                      {phoneItem.number}
                    </span>
                    {phoneItem.isDefault === 1 && <Tag color="green" className="text-[10px] py-0 leading-tight border-0 ml-1">Default</Tag>}
                  </a>
                  <button
                    type="button"
                    onClick={(e) => handleCopyOnly(e, phoneItem.number)}
                    className="hover:text-green-600 hover:bg-slate-100 text-slate-400 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                    title="Copy phone number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              legacyPhones.map((phoneStr: string, idx: number) => (
                <div key={`lp-${idx}`} className="flex items-center gap-1.5 text-sm text-slate-600 group transition-colors">
                  <a
                    href={`tel:${phoneStr.replace(/[^0-9+]/g, "")}`}
                    onClick={(e) => handlePhoneClick(e, phoneStr)}
                    className="flex items-center gap-2 hover:text-green-600 truncate max-w-[190px] cursor-pointer"
                    title="Click to call on phone, or copy on desktop"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-green-600 shrink-0" />
                    <span className="truncate">{phoneStr}</span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => handleCopyOnly(e, phoneStr)}
                    className="hover:text-green-600 hover:bg-slate-100 text-slate-400 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                    title="Copy phone number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}

            {/* Websites */}
            {websiteUrl && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]" title={websiteUrl}>{websiteUrl}</span>
              </div>
            )}

            {/* Facebook */}
            {fbPageUrl && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                <a
                  href={fbPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook Page</span>
                </a>
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: "Lead Status",
      key: "lead_status",
      width: 260,
      render: (_: any, record: any) => {
        const status = record.status
        if (!status) return <span className="text-slate-400 text-xs italic">No Contact</span>

        let color = "default"
        if (status === "Called - Interested") color = "green"
        else if (status === "Called - Not Interested") color = "red"
        else if (status === "Meeting Scheduled") color = "purple"
        else if (status === "Called - No Response") color = "orange"
        else if (status === "Note") color = "blue"
        else if (status === "Hot") color = "volcano"
        else if (status === "Less Interest") color = "cyan"
        else if (status === "Own (using our system)") color = "geekblue"

        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Tag color={color} className="font-medium px-2.5 py-0.5 rounded-full border-0 !m-0">
                {status}
              </Tag>
              {record.statusDate && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dayjs(record.statusDate).format("MMM DD, YYYY")}</span>
                </div>
              )}
            </div>
            {record.statusNote && (
              <Tooltip title={record.statusNote} placement="topLeft">
                <div className="text-xs text-slate-500 italic pl-1.5 border-l-2 border-slate-200 mt-1 line-clamp-2 max-w-[200px] cursor-help">
                  "{record.statusNote}"
                </div>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: "License Status",
      key: "status",
      width: 180,
      responsive: ["sm"] as any,
      render: (_: any, record: any) => {
        const expiryDate = record.license_expired_date
        const isExpired = dayjs(expiryDate).isBefore(dayjs())

        return (
          <div className="space-y-2">
            {expiryDate && (
              <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded w-fit ${isExpired ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                <Calendar className="w-3 h-3" />
                Expires: {dayjs(expiryDate).format("MMM DD, YYYY")}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: narrowViewport ? 140 : 220,
      fixed: "right" as const,
      render: (_: any, record: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenModal(record)}
              variant="outline"
              className="h-9 w-9 sm:w-auto p-2 sm:px-3 flex items-center justify-center gap-1.5 rounded-lg"
              title="Update Agency"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Update Agency</span>
            </Button>
            <Button
              onClick={() => openHistoryModal(record)}
              className="h-9 w-9 sm:w-auto p-2 sm:px-3 flex items-center justify-center gap-1.5 rounded-lg"
              title="History"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Tooltip title={messageBody ? "Copy WA template & log message sent" : "Draft a template first"}>
              <Button
                onClick={() => handleSendWhatsAppManual(record)}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center p-2 h-9 w-9 rounded-lg"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.461 5.432.001 9.853-4.417 9.856-9.853.002-2.63-1.019-5.101-2.877-6.961C17.176 1.941 14.707 1.002 12 1.002 6.568 1.002 2.15 5.42 2.148 10.858c-.001 1.942.507 3.84 1.47 5.514L2.68 21.027l4.967-1.303zM17.43 14.88c-.3-.15-1.77-.874-2.045-.975-.275-.101-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.08-.962-1.81-2.15-2.02-2.5-.21-.35-.023-.54.152-.715.157-.157.35-.41.525-.615.175-.205.233-.35.35-.585.117-.234.058-.44-.029-.615-.088-.175-.675-1.63-.925-2.235-.244-.589-.491-.51-.675-.52-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.116 4.52.716.31 1.274.495 1.71.63.719.228 1.375.196 1.892.118.577-.088 1.77-.724 2.02-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                </svg>
              </Button>
            </Tooltip>
          </div>
        );
      }
    },

  ]

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Title 
            level={3} 
            className="!m-0 text-slate-800 select-none" 
          >
            Registered Agencies
          </Title>
          <Text type="secondary" className="text-slate-500">
            Official list of travel agencies from the government registry.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-3">

          <Button
            onClick={handleCreateCampaignClick}
          >
            <MessageSquare className="w-4 h-4" />
            {messageBody ? "Edit Campaign Message" : "Create Campaign"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-1 md:p-2 rounded-xl shadow-sm border border-slate-200 min-w-0 overflow-hidden w-full">
        <AdminFilterToolbar
          showSearch
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by agency name, license, email, phone or address..."
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          filterExtras={
            <div className="flex items-center gap-2">
              <Select
                value={listFilter}
                onChange={setListFilter}
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "All Agencies" },
                  { value: "new", label: "New Agencies" },
                  { value: "fb_available", label: "FB Available" },
                  { value: "trabill_user", label: "Trabill User" },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "none", label: "No Status" },
                  { value: "Note", label: "Note" },
                  { value: "Called - No Response", label: "Called - No Response" },
                  { value: "Called - Interested", label: "Called - Interested" },
                  { value: "Called - Not Interested", label: "Called - Not Interested" },
                  { value: "Meeting Scheduled", label: "Meeting Scheduled" },
                  { value: "Hot", label: "Hot" },
                  { value: "Less Interest", label: "Less Interest" },
                  { value: "Own (using our system)", label: "Own (using our system)" },
                ]}
              />
              <Select
                value={selectedCampaignId}
                onChange={(val) => {
                  setSelectedCampaignId(val || undefined);
                  if (!val) {
                    setCampaignStatusFilter("sent");
                  }
                }}
                placeholder="Filter by Campaign"
                style={{ width: 220 }}
                allowClear
                options={campaignsList.map((c: any) => ({
                  value: c._id,
                  label: c.type === 'email' ? `Email: ${c.subject}` : `WA: ${c.body.substring(0, 30)}...`
                }))}
              />
              {selectedCampaignId && (
                <Select
                  value={campaignStatusFilter}
                  onChange={setCampaignStatusFilter}
                  style={{ width: 120 }}
                  options={[
                    { value: "sent", label: "Sent" },
                    { value: "not_sent", label: "Not Sent" },
                  ]}
                />
              )}
            </div>
          }
          showRefresh
          onRefresh={() => refetch()}
        >
          <Button
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Agency
          </Button>
        </AdminFilterToolbar>

        {messageBody && selectedRowKeys.length > 0 && (
          <BulkCampaignActionBar
            selectedRecords={rows.filter((r: any) => selectedRowKeys.includes(r.id))}
            messageSubject={messageSubject}
            messageBody={messageBody}
            onSuccess={() => setSelectedRowKeys([])}
            refetchCampaigns={refetchCampaigns}
          />
        )}

        <Table
          rowSelection={messageBody ? {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          } : undefined}
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          rowKey="id"
          size="middle"
          rowClassName={(record) => record.is_new === 1 ? 'is-new-row' : ''}
          pagination={{
            current: page,
            pageSize: limit,
            total,
                          pageSizeOptions: ["20", "50", "100", "200","300", "500"],
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p)
              setLimit(ps)
            },
            showTotal: (t) => (
              <span className="text-slate-500 font-medium">
                Showing {Math.min(total, (page - 1) * limit + 1)} - {Math.min(total, page * limit)} of {t} agencies
              </span>
            ),
          }}
          scroll={{ x: "max-content" }}
          className="admin-table ant-table-responsive border-none custom-scrollbar"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Update Agency Contacts
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        destroyOnHidden
        footer={null}
        width={700}
      >
        <div className="mb-4 text-sm text-slate-500">
          Updating contact info for <strong>{selectedAgency?.agency_name_license?.split('\n')[0] || "Agency"}</strong>
        </div>
        <Form form={form} layout="vertical" onFinish={handleUpdateAgency}>
          <Form.Item
            name="facebook_page"
            label="Facebook Page URL"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="https://facebook.com/..." size="large" prefix={<Facebook className="w-4 h-4 text-slate-400" />} />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Form.Item
              name="website"
              label="Website"
              rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              className="mb-0"
            >
              <Input placeholder="https://www.example.com" size="large" prefix={<Globe className="w-4 h-4 text-slate-400" />} />
            </Form.Item>
            
            <Form.Item
              name="trabillExp"
              label="Trabill Expiration Date"
              className="mb-0"
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emails List */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Addresses
              </div>
              <Form.List name="emails">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2 items-start mb-3 bg-white p-2 border border-slate-200 rounded">
                        <div className="flex-1 space-y-2">
                          <Form.Item
                            {...restField}
                            name={[name, 'address']}
                            rules={[{ required: true, message: 'Missing email' }, { type: 'email', message: 'Invalid email' }]}
                            className="mb-0"
                          >
                            <Input placeholder="Email Address" size="small" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'isDefault']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <Checkbox className="text-xs">Set as Default</Checkbox>
                          </Form.Item>
                        </div>
                        <AntButton type="text" danger onClick={() => remove(name)} icon={<Trash2 className="w-4 h-4" />} />
                      </div>
                    ))}
                    <Form.Item className="mb-0">
                      <AntButton type="dashed" onClick={() => add({ isDefault: fields.length === 0 })} block icon={<Plus className="w-4 h-4" />}>
                        Add Email
                      </AntButton>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>

            {/* Phones List */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Numbers
              </div>
              <Form.List name="phones">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2 items-start mb-3 bg-white p-2 border border-slate-200 rounded">
                        <div className="flex-1 space-y-2">
                          <Form.Item
                            {...restField}
                            name={[name, 'number']}
                            rules={[{ required: true, message: 'Missing number' }]}
                            className="mb-0"
                          >
                            <Input placeholder="Phone Number" size="small" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'isDefault']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <Checkbox className="text-xs">Set as Default</Checkbox>
                          </Form.Item>
                        </div>
                        <AntButton type="text" danger onClick={() => remove(name)} icon={<Trash2 className="w-4 h-4" />} />
                      </div>
                    ))}
                    <Form.Item className="mb-0">
                      <AntButton type="dashed" onClick={() => add({ isDefault: fields.length === 0 })} block icon={<Plus className="w-4 h-4" />}>
                        Add Phone
                      </AntButton>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save Agency Contacts"}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Add Agency Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Add New Agency
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false)
          addForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddAgency} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="name"
              label="Agency Name"
              rules={[{ required: true, message: 'Please enter the agency name' }]}
              className="md:col-span-2"
            >
              <Input placeholder="e.g. Travel Sky Tours" size="large" />
            </Form.Item>

            <Form.Item name="license" label="License Number">
              <Input placeholder="e.g. 0012345" size="large" />
            </Form.Item>

            <Form.Item name="expiry" label="License Expiry Date">
              <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item name="email" label="Email Address">
              <Input placeholder="e.g. contact@travelsky.com" size="large" type="email" />
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="e.g. 01711223344" size="large" />
            </Form.Item>

            <Form.Item name="website" label="Website URL" className="md:col-span-2">
              <Input placeholder="e.g. www.travelsky.com" size="large" />
            </Form.Item>

            <Form.Item name="address" label="Business Address" className="md:col-span-2">
              <Input.TextArea placeholder="Enter full address" rows={3} />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false)
                addForm.resetFields()
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addAgencyMutation.isPending}
              className="px-6 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
              {addAgencyMutation.isPending ? "Adding..." : "Add Agency"}
            </button>
          </div>
        </Form>
      </Modal>

      <CampaignTemplateModal
        open={isMessageModalOpen}
        onCancel={() => setIsMessageModalOpen(false)}
        messageSubject={messageSubject}
        setMessageSubject={setMessageSubject}
        messageBody={messageBody}
        setMessageBody={setMessageBody}
        campaignsList={campaignsList}
      />

      {/* History Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 border-b pb-3 mb-4">
            <Clock className="w-5 h-5 text-slate-500" />
            Communication History - {selectedHistoryAgency?.agency_name_license?.split('\n')[0] || "Agency"}
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => {
          setIsHistoryModalOpen(false)
          setSelectedHistoryAgency(null)
          noteForm.resetFields()
        }}
        footer={null}
        width={700}
        destroyOnHidden
      >
        <div className="max-h-[400px] overflow-y-auto pr-2 mb-4 pb-4">
          {isLoadingHistory ? (
            <div className="text-center py-8 text-slate-500">Loading history...</div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No communication history yet.</div>
          ) : (
            <Timeline
              className="mt-4"
              items={historyData.map((item: any) => {
                const dateStr = dayjs(item.createdAt).format("MMM DD, YYYY - hh:mm A")
                if (item.type === 'manual_note') {
                  return {
                    color: "blue",
                    content: (
                      <div className="pb-6 pt-0.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-slate-800">Manual Note</span>
                          {item.status && (
                            <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 rounded-full">
                              {item.status}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium ml-auto">{dateStr}</span>
                        </div>
                        <div className="text-sm text-slate-700 bg-blue-50/50 p-3.5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                          {item.note}
                        </div>
                      </div>
                    )
                  }
                } else {
                  // Campaign
                  const campaign = item.campaign_id
                  const isWhatsApp = campaign?.type === 'whatsapp'
                  const formattedBody = formatMessage(campaign?.body || "", selectedHistoryAgency)

                  return {
                    color: isWhatsApp ? "#25D366" : "#6366f1",
                    content: (
                      <div className="pb-6 pt-0.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-slate-800">
                            {isWhatsApp ? 'Bulk WhatsApp' : 'Bulk Email'}
                          </span>
                          <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${isWhatsApp ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            Sent
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium ml-auto">{dateStr}</span>
                        </div>
                        <div className={`text-sm p-4 rounded-lg shadow-sm border-l-4 ${isWhatsApp ? 'bg-[#f0fdf4]/50 border-[#25D366]' : 'bg-indigo-50/50 border-indigo-500'}`}>
                          {campaign?.subject && !isWhatsApp && (
                            <div className="font-semibold text-indigo-900 mb-2 pb-2 border-b border-indigo-100/50">
                              Subject: {campaign.subject}
                            </div>
                          )}
                          <div className={`whitespace-pre-wrap leading-relaxed ${isWhatsApp ? 'text-green-900' : 'text-indigo-900'}`}>
                            {formattedBody}
                          </div>
                        </div>
                      </div>
                    )
                  }
                }
              })}
            />
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Add Communication Note
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400">Quick Actions:</span>
              {QUICK_NOTE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={addNoteMutation.isPending}
                  onClick={() => handleQuickPreset(preset)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xs ${preset.color}`}
                  title={`Set status to "${preset.status}" and save note`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <Form form={noteForm} layout="vertical" onFinish={handleAddNote} className="mb-0">
            <div className="flex gap-3">
              <div className="flex-1">
                <Form.Item name="note" className="mb-0" rules={[{ required: true, message: 'Please enter a note' }]}>
                  <Input.TextArea 
                    placeholder="Type your note here... (e.g., Called them, they asked to call back next week)" 
                    rows={2} 
                    className="resize-none"
                  />
                </Form.Item>
              </div>
              <div className="w-[200px] flex flex-col gap-2 justify-end">
                <Form.Item name="status" className="mb-0">
                  <Select placeholder="Select Status" options={[
                    { value: "Note", label: "Note" },
                    { value: "Called - No Response", label: "Called - No Response" },
                    { value: "Called - Interested", label: "Called - Interested" },
                    { value: "Called - Not Interested", label: "Called - Not Interested" },
                    { value: "Meeting Scheduled", label: "Meeting Scheduled" },
                    { value: "Hot", label: "Hot" },
                    { value: "Less Interest", label: "Less Interest" },
                    { value: "Own (using our system)", label: "Own (using our system)" },
                  ]} />
                </Form.Item>
                <Button
                  type="submit"
                  disabled={addNoteMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
                >
                  {addNoteMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      <style jsx global>{`
        .admin-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #f1f5f9;
        }
        .admin-table .ant-table-tbody > tr > td {
          padding: 16px;
        }
        .admin-table .ant-table-row:hover > td {
          background: #f1f5f9/50 !important;
        }
        .admin-table .is-new-row td {
          background-color: #f0fdf4 !important;
        }
        @media (max-width: 640px) {
          .admin-table .ant-table-thead > tr > th {
            padding: 10px 8px !important;
            font-size: 10px;
          }
          .admin-table .ant-table-tbody > tr > td {
            padding: 10px 8px !important;
          }
        }
      `}</style>
    </div>
  )
}
