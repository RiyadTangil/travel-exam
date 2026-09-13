"use client"

import React from "react"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { Calendar as CalendarIcon, CheckCircle2, Clock, Edit, Trash2, User, Phone, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CRMLead } from "./crm-drawer"
import type { TaskItem } from "./types"

export interface DateScheduleDrawerProps {
  open: boolean
  onClose: () => void
  selectedDate: Dayjs
  tasks: TaskItem[]
  leads: CRMLead[]
  canDelete?: boolean
  onToggleTask: (taskId: string) => void
  onEditTask: (task: TaskItem) => void
  onDeleteTask: (task: TaskItem) => void
  onViewLead: (lead: CRMLead) => void
}

export function DateScheduleDrawer({
  open,
  onClose,
  selectedDate,
  tasks,
  leads,
  canDelete = false,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onViewLead,
}: DateScheduleDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 to-indigo-50/50 flex-shrink-0 text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-slate-900 leading-tight">
                Schedule for {selectedDate.format("MMMM D, YYYY")}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 mt-0.5">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} &bull; {leads.length} follow-up{leads.length === 1 ? "" : "s"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-6">
            {/* ── Tasks Section ─────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  Assigned Tasks
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </h4>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  No tasks scheduled for this day
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        t.completed
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-purple-50/40 border-purple-100 shadow-2xs hover:border-purple-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5
                              className={`text-xs font-bold text-slate-900 leading-snug ${
                                t.completed ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {t.title}
                            </h5>
                            {t.completed ? (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                                Completed
                              </span>
                            ) : (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  t.priority === "HIGH"
                                    ? "bg-rose-100 text-rose-700"
                                    : t.priority === "MEDIUM"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {t.priority}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400 inline shrink-0" />
                            <span>{t.clientName}</span>
                            {t.mobile && (
                              <span className="text-slate-400">({t.mobile})</span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">Staff: {t.assignedTo}</span>
                          </p>

                          <p className="text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-purple-600" />
                            {dayjs(t.dueDate).format("hh:mm A")}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-purple-100/60">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onToggleTask(t.id)}
                          className={`h-7 px-2.5 text-[10.5px] font-bold transition-colors ${
                            t.completed
                              ? "text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                              : "text-slate-700 border-slate-200 bg-white hover:bg-slate-100"
                          }`}
                        >
                          {t.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                          ) : (
                            <Check className="h-3 w-3 mr-1 text-slate-400" />
                          )}
                          {t.completed ? "Done" : "Mark Done"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onEditTask(t)}
                          className="h-7 px-2.5 text-[10.5px] font-bold text-sky-700 border-sky-200 bg-sky-50 hover:bg-sky-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </Button>
                        {canDelete && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteTask(t)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Client Follow-ups Section ─────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  Client Follow-ups
                  <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                </h4>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  No client follow-ups scheduled for this day
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 bg-sky-50/40 rounded-xl border border-sky-100 shadow-2xs hover:border-sky-200 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {l.clientName} {l.destination ? `(${l.destination})` : ""}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          Value: ৳ {Number(l.estimatedValue || 0).toLocaleString()} &bull; Staff: {l.assignedTo}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewLead(l)}
                        className="h-7 px-2.5 text-[10.5px] font-bold text-sky-700 border-sky-200 bg-white hover:bg-sky-50 shrink-0"
                      >
                        View Lead <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
