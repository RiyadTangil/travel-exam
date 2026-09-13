"use client"

import React from "react"
import { Award, BellRing, CheckCircle2, Target, TrendingUp } from "lucide-react"
import { CrmMetricsData } from "./types"
export interface CRMKpiCardsProps {
  metrics: CrmMetricsData
}

export function CRMKpiCards({ metrics }: CRMKpiCardsProps) {
  const isDueTodayActive = (metrics.todayTasksCount || 0) > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md">
            <Target className="h-4 w-4 text-white" />
          </span>
          Travel CRM &amp; Task Schedule
          <span className="text-[10px] font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-2.5 py-0.5 rounded-full tracking-wide">
            PRO
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 ml-10">
          Manage walk-ins, schedule tasks, track passport/visa expiries &amp; sales pipeline
        </p>
      </div>

      {/* Bold KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-slate-100">
        <div className="p-4 flex items-center gap-3 border-r border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</p>
            <p className="text-lg font-extrabold text-sky-700 leading-tight">
              ৳ {((metrics.totalPipelineValue || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-[10px] text-slate-500">{metrics.activeCount || 0} active leads</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3 border-r border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Won Revenue</p>
            <p className="text-lg font-extrabold text-emerald-700 leading-tight">
              ৳ {((metrics.wonValue || 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-[10px] text-slate-500">{metrics.wonCount || 0} bookings closed</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3 border-r border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
            <p className="text-lg font-extrabold text-indigo-700 leading-tight">
              {metrics.conversionRate || 0}%
            </p>
            <p className="text-[10px] text-slate-500">of {metrics.totalCount || 0} total leads</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDueTodayActive
                ? "bg-amber-50 border border-amber-200"
                : "bg-slate-50 border border-slate-100"
            }`}
          >
            <BellRing
              className={`h-5 w-5 ${
                isDueTodayActive ? "text-amber-600" : "text-slate-400"
              }`}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Today</p>
            <p
              className={`text-lg font-extrabold leading-tight ${
                isDueTodayActive ? "text-amber-700" : "text-slate-500"
              }`}
            >
              {metrics.todayTasksCount || 0} Tasks
            </p>
            <p className="text-[10px] text-slate-500">need attention now</p>
          </div>
        </div>
      </div>
    </div>
  )
}
