"use client"

import React from "react"
import dayjs from "dayjs"
import { CheckCircle2, Clock, Edit, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TaskItem } from "./types"

export interface TasksQueueListProps {
  tasks: TaskItem[]
  canDelete?: boolean
  onToggle: (taskId: string) => void
  onEdit: (task: TaskItem) => void
  onDelete: (task: TaskItem) => void
  onScheduleTask?: () => void
}

export function TasksQueueList({
  tasks,
  canDelete = false,
  onToggle,
  onEdit,
  onDelete,
  onScheduleTask,
}: TasksQueueListProps) {
  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Scheduled Tasks Queue</h4>
          <p className="text-xs text-slate-500">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
            No scheduled tasks. Click &quot;Schedule Task&quot; above or schedule follow-ups on leads.
          </div>
        ) : (
          tasks.map((t) => {
            const todayStr = dayjs().format("YYYY-MM-DD")
            const isOverdue = !t.completed && t.dueDate < dayjs().format("YYYY-MM-DD HH:mm")
            const isDueToday = !t.completed && !isOverdue && t.dueDate.startsWith(todayStr)

            const categoryStyle: Record<string, { border: string; bg: string; badge: string; icon: string }> = {
              VISA_EXPIRY: {
                border: "border-l-rose-500",
                bg: isOverdue ? "bg-rose-50" : isDueToday ? "bg-amber-50" : "bg-white",
                badge: "bg-rose-100 text-rose-700",
                icon: "📄",
              },
              PASSPORT_EXPIRY: {
                border: "border-l-amber-500",
                bg: isOverdue ? "bg-rose-50" : isDueToday ? "bg-amber-50" : "bg-white",
                badge: "bg-amber-100 text-amber-700",
                icon: "🛂",
              },
              PRE_DEPARTURE: {
                border: "border-l-sky-500",
                bg: isOverdue ? "bg-rose-50" : isDueToday ? "bg-amber-50" : "bg-white",
                badge: "bg-sky-100 text-sky-700",
                icon: "🛫",
              },
              WALK_IN_FOLLOWUP: {
                border: "border-l-orange-500",
                bg: isOverdue ? "bg-rose-50" : isDueToday ? "bg-amber-50" : "bg-white",
                badge: "bg-orange-100 text-orange-700",
                icon: "🚶",
              },
              GENERAL_CALL: {
                border: "border-l-slate-400",
                bg: isOverdue ? "bg-rose-50" : isDueToday ? "bg-amber-50" : "bg-white",
                badge: "bg-slate-100 text-slate-600",
                icon: "📞",
              },
            }
            const cat = categoryStyle[t.category] || categoryStyle.GENERAL_CALL

            return (
              <div
                key={t.id}
                className={`rounded-xl border-l-4 border border-slate-200 transition-all flex items-start justify-between gap-3 overflow-hidden ${
                  t.completed
                    ? "bg-slate-50 border-l-slate-300 opacity-55"
                    : `${cat.border} ${cat.bg} shadow-sm`
                }`}
              >
                <div className="flex items-start gap-3 flex-1 p-3.5">
                  <button
                    type="button"
                    onClick={() => onToggle(t.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      t.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-300 hover:border-sky-500 bg-white"
                    }`}
                  >
                    {t.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.badge}`}>
                        {cat.icon} {t.category.replace(/_/g, " ")}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                          OVERDUE
                        </span>
                      )}
                      {isDueToday && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                          DUE TODAY
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-xs font-bold text-slate-900 leading-snug ${
                        t.completed ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {t.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <User className="h-3 w-3" /> {t.clientName} {t.mobile ? `· ${t.mobile}` : ""}
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isOverdue ? "text-rose-700" : isDueToday ? "text-amber-700" : "text-purple-700"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {dayjs(t.dueDate).format("MMM D, YYYY HH:mm")}
                      </span>
                      <span className="text-slate-500">→ {t.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-2 p-3 pl-0">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      t.priority === "HIGH"
                        ? "bg-rose-100 text-rose-700"
                        : t.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(t)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {canDelete && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(t)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
