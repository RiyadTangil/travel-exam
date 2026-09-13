"use client"

import React, { useState } from "react"
import dayjs from "dayjs"
import { Dropdown } from "antd"
import { Clock, Compass, Flame, GripVertical, MoveRight, Phone } from "lucide-react"
import {
  CRMLead,
  LeadStage,
  STAGE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "./crm-drawer"

export interface PipelineKanbanBoardProps {
  leads: CRMLead[]
  onOpenView: (lead: CRMLead) => void
  onMoveStage: (leadId: string, newStage: LeadStage) => void
}

export function PipelineKanbanBoard({
  leads,
  onOpenView,
  onMoveStage,
}: PipelineKanbanBoardProps) {
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingLeadId(leadId)
    e.dataTransfer.setData("text/plain", leadId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggingLeadId(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stageValue: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverStage !== stageValue) {
      setDragOverStage(stageValue)
    }
  }

  const handleDragLeave = (e: React.DragEvent, stageValue: string) => {
    if (dragOverStage === stageValue) {
      setDragOverStage(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("text/plain") || draggingLeadId
    setDraggingLeadId(null)
    setDragOverStage(null)

    if (!leadId) return
    const targetLead = leads.find((l) => l.id === leadId)
    if (targetLead && targetLead.stage !== targetStage) {
      onMoveStage(leadId, targetStage)
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1100px] items-start pt-2">
        {STAGE_OPTIONS.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.value)
          const stageTotal = stageLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0)

          return (
            <div
              key={stage.value}
              onDragOver={(e) => handleDragOver(e, stage.value)}
              onDragLeave={(e) => handleDragLeave(e, stage.value)}
              onDrop={(e) => handleDrop(e, stage.value)}
              className={`flex-1 min-w-[220px] bg-slate-50/70 rounded-2xl border p-3 transition-all duration-200 ${
                dragOverStage === stage.value
                  ? "border-sky-500 ring-2 ring-sky-200 bg-sky-50/50 scale-[1.01]"
                  : "border-slate-200/80"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      stage.value === "WON"
                        ? "bg-emerald-500 ring-2 ring-emerald-200"
                        : stage.value === "LOST"
                        ? "bg-slate-400"
                        : "bg-sky-500 ring-2 ring-sky-200"
                    }`}
                  />
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {stage.label}
                  </h4>
                  <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-500">
                  ৳{(stageTotal / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Drag over indicator banner */}
              {dragOverStage === stage.value && (
                <div className="mb-3 p-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold text-center animate-pulse flex items-center justify-center gap-1.5 shadow-md">
                  <MoveRight className="h-3.5 w-3.5" /> Drop to move to {stage.label}
                </div>
              )}

              <div className="space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 border-2 border-dashed border-slate-200/90 rounded-2xl flex flex-col items-center gap-1.5 bg-white/40">
                    <Compass className="h-5 w-5 text-slate-300" />
                    <span className="font-semibold">No leads here</span>
                    <span className="text-[10px] text-slate-400">Drag &amp; drop a lead here</span>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const serviceObj = SERVICE_TYPE_OPTIONS.find((s) => s.value === lead.serviceType)
                    const isOverdue = lead.nextFollowUp && dayjs(lead.nextFollowUp).isBefore(dayjs())
                    const isHighPriority = lead.priority === "HIGH"
                    const isDragging = draggingLeadId === lead.id

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border transition-all duration-150 group cursor-grab active:cursor-grabbing overflow-hidden ${
                          isDragging
                            ? "opacity-30 border-2 border-dashed border-sky-400 scale-95 shadow-none"
                            : isHighPriority
                            ? "border-l-4 border-l-rose-500 border-r border-t border-b border-slate-200 hover:shadow-md hover:border-slate-300"
                            : "border-slate-200 hover:shadow-md hover:border-slate-300"
                        }`}
                        onClick={() => onOpenView(lead)}
                      >
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-start gap-1">
                              <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1">
                                  {isHighPriority && (
                                    <Flame className="h-3 w-3 text-rose-500 fill-rose-400 flex-shrink-0" />
                                  )}
                                  {lead.clientName}
                                </h4>
                                {lead.source === "WALK_IN" && (
                                  <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                    Walk-in
                                  </span>
                                )}
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="h-3 w-3 text-slate-400" /> {lead.mobile}
                                </p>
                              </div>
                            </div>
                            <span className="text-base leading-none">{serviceObj?.icon}</span>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <span
                              className="font-semibold text-slate-600 truncate max-w-[110px]"
                              title={lead.destination}
                            >
                              📍 {lead.destination}
                            </span>
                            <span className="font-extrabold text-sky-700">
                              ৳{(lead.estimatedValue / 1000).toFixed(0)}k
                            </span>
                          </div>

                          {lead.nextFollowUp && (
                            <div
                              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                isOverdue ? "bg-rose-50 text-rose-700" : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              <Clock
                                className={`h-3 w-3 ${isOverdue ? "text-rose-500" : "text-purple-500"}`}
                              />
                              <span className="truncate">
                                {dayjs(lead.nextFollowUp).format("MMM D, HH:mm")}
                              </span>
                              {isOverdue && (
                                <span className="text-[9px] bg-rose-200 text-rose-800 px-1 rounded">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-0.5 text-[11px]">
                            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                              {lead.assignedTo ? lead.assignedTo.split(" ")[0] : "Unassigned"}
                            </span>
                            <Dropdown
                              menu={{
                                items: STAGE_OPTIONS.map((s) => ({
                                  key: s.value,
                                  label: `→ ${s.label}`,
                                  onClick: (e) => {
                                    e.domEvent.stopPropagation()
                                    onMoveStage(lead.id, s.value)
                                  },
                                })),
                              }}
                            >
                              <span
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Move ▾
                              </span>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
