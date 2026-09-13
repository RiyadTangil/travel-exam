"use client"

import { useState, useMemo } from "react"
import { Modal, Avatar, Timeline, message } from "antd"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  Compass,
  Flame,
  Edit,
  Receipt,
  Calendar,
  Users,
  MapPin,
} from "lucide-react"
import { CRMLead, STAGE_OPTIONS, SERVICE_TYPE_OPTIONS } from "./crm-drawer"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMutationApi } from "@/hooks/api/useMutationApi"
import { ENDPOINTS } from "@/lib/api/api-endpoints"
import { queryKeys } from "@/hooks/api/queryKeys"

export type ViewLeadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: CRMLead | null
  onEdit?: (lead: CRMLead) => void
  onLogCall?: (lead: CRMLead) => void
  onConvertToInvoice?: (lead: CRMLead) => void
}

export function ViewLeadModal({
  open,
  onOpenChange,
  lead,
  onEdit,
  onLogCall,
  onConvertToInvoice,
}: ViewLeadModalProps) {
  const router = useRouter()
  const [newNote, setNewNote] = useState("")

  const updateMutation = useMutationApi(ENDPOINTS.CRM.LEADS.URL, {
    method: "PUT",
    invalidateKeys: [
      [...queryKeys.lists(), ENDPOINTS.CRM.LEADS.KEY],
      [...queryKeys.details(), ENDPOINTS.CRM.METRICS.KEY],
    ],
    successMessage: "Note added to activity log",
  })

  const notesList = useMemo(() => {
    if (!lead?.notes) return []
    const lines = lead.notes.split("\n").filter((line) => line.trim().length > 0)
    return lines.map((line, idx) => {
      const match = line.match(/^\[(.*?)\]\s*(.*)$/)
      if (match) {
        return {
          id: String(idx),
          time: match[1],
          author: "System / Agent",
          text: match[2],
        }
      }
      return {
        id: String(idx),
        time: "Log Entry",
        author: "System / Agent",
        text: line,
      }
    }).reverse()
  }, [lead?.notes])

  if (!lead) return null

  const stageObj  = STAGE_OPTIONS.find((s) => s.value === lead.stage)  || STAGE_OPTIONS[0]
  const serviceObj = SERVICE_TYPE_OPTIONS.find((s) => s.value === lead.serviceType) || SERVICE_TYPE_OPTIONS[0]

  const handleAddNote = () => {
    if (!newNote.trim() || !lead) return
    const timeStr = dayjs().format("MMM D, YYYY h:mm A")
    const formattedEntry = `[${timeStr}] Note: ${newNote.trim()}`
    const updatedNotes = lead.notes ? `${lead.notes}\n${formattedEntry}` : formattedEntry

    updateMutation.mutate({
      id: lead.id,
      notes: updatedNotes,
    })
    setNewNote("")
  }

  const isOverdueFollowUp = lead.nextFollowUp ? dayjs(lead.nextFollowUp).isBefore(dayjs()) : false

  // Stage gradient map
  const stageGradient: Record<string, string> = {
    NEW:      "from-blue-600 to-blue-800",
    QUALIFIED:"from-cyan-600 to-cyan-800",
    QUOTED:   "from-orange-500 to-orange-700",
    FOLLOWUP: "from-purple-600 to-purple-800",
    WON:      "from-emerald-600 to-emerald-800",
    LOST:     "from-rose-600 to-rose-800",
  }

  const handleConvertToInvoice = () => {
    onOpenChange(false)
    if (onConvertToInvoice) {
      onConvertToInvoice(lead)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={700}
      destroyOnClose
      closeIcon={
        <span className="bg-slate-900/80 hover:bg-slate-900 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all shadow-md text-xs font-extrabold border border-white/40">
          ✕
        </span>
      }
      styles={{ body: { padding: 0 }, header: { display: "none" } }}
    >
      {/* ── Hero Banner ── */}
      <div className={`bg-gradient-to-br ${stageGradient[lead.stage] || "from-slate-600 to-slate-800"} p-5 rounded-t-lg`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              size={48}
              className="bg-white/20 text-white font-extrabold text-xl border-2 border-white/30 flex-shrink-0"
            >
              {lead.clientName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-white leading-tight">{lead.clientName}</h3>
                {lead.priority === "HIGH" && (
                  <span className="flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Flame className="h-3 w-3" /> URGENT
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                #{lead.id.slice(-6).toUpperCase()} · {lead.source.replace(/_/g, " ")} · {lead.createdAt}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-white/90 text-xs flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {lead.mobile}
                </span>
                {lead.email && (
                  <span className="text-white/90 text-xs flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {lead.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Value & Stage */}
          <div className="text-right flex-shrink-0">
            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mb-1">Est. Value</p>
            <p className="text-2xl font-extrabold text-white">৳{(lead.estimatedValue / 1000).toFixed(0)}k</p>
            <span className="inline-block mt-1 text-[11px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {stageObj.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">

        {/* ── Key Details Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="p-3 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service</p>
            <p className="text-sm font-bold text-slate-800">{serviceObj.icon} {serviceObj.label}</p>
          </div>
          <div className="p-3 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" /> {lead.destination}
            </p>
          </div>
          <div className="p-3 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pax</p>
            <p className="text-xs font-semibold text-slate-700">
              {lead.paxAdults} Adult{lead.paxAdults > 1 ? "s" : ""}
              {lead.paxChildren > 0 ? ` + ${lead.paxChildren} Child` : ""}
            </p>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" /> {lead.assignedTo}
            </p>
          </div>
        </div>

        {/* ── Schedule & Notes Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Travel Date */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure</p>
                <p className="font-semibold text-slate-700">{lead.travelDate || "Flexible / Not Set"}</p>
              </div>
            </div>
            {/* Next Follow-up */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                isOverdueFollowUp ? "bg-rose-50 border-rose-200" : "bg-purple-50 border-purple-100"
              }`}>
                <Clock className={`h-3.5 w-3.5 ${isOverdueFollowUp ? "text-rose-600" : "text-purple-600"}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Follow-up</p>
                <p className={`font-bold ${isOverdueFollowUp ? "text-rose-700" : "text-purple-700"}`}>
                  {lead.nextFollowUp
                    ? dayjs(lead.nextFollowUp).format("MMM D, YYYY HH:mm")
                    : "Not scheduled"}
                  {isOverdueFollowUp && (
                    <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">OVERDUE</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 text-xs text-slate-600 leading-relaxed">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</p>
              {lead.notes}
            </div>
          )}
        </div>

        {/* ── Action Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-gradient-to-r from-slate-50 to-sky-50/50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { onOpenChange(false); if (onEdit) onEdit(lead) }}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { if (onLogCall) onLogCall(lead) }}
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5 text-sky-600" /> Log Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              onClick={() =>
                window.open(
                  `https://wa.me/88${lead.mobile}?text=${encodeURIComponent(
                    `Hello ${lead.clientName}, regarding your travel enquiry for ${lead.destination}...`
                  )}`
                )
              }
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> WhatsApp
            </Button>
          </div>
          {/* 
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
            onClick={handleConvertToInvoice}
          >
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            Convert → {serviceObj.icon} Invoice
          </Button>
          */}
        </div>

        {/* ── Activity Timeline ── */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Activity &amp; Contact Log
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-slate-50 placeholder:text-slate-400"
              placeholder="Log a quick call update or client response..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              loading={updateMutation.isPending}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Send className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>

          <div className="max-h-44 overflow-y-auto pr-1">
            <Timeline
              items={notesList.map((n) => ({
                color: "blue",
                children: (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar size={18} className="bg-sky-600 text-white text-[9px] flex-shrink-0">
                          {n.author.charAt(0)}
                        </Avatar>
                        <span className="font-bold text-slate-700">{n.author}</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">{n.time}</span>
                    </div>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed ml-5">
                      {n.text}
                    </p>
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
