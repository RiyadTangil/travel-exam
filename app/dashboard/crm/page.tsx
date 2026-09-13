"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Table, Tag, Tabs, Dropdown, message, Select, Calendar } from "antd"
import type { ColumnsType } from "antd/es/table"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import {
  Plus,
  Clock,
  Phone,
  Compass,
  Flame,
  Calendar as CalendarIcon,
  LayoutGrid,
  CheckSquare,
  List,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import FilterToolbar from "@/components/shared/filter-toolbar"
import { TableRowActions } from "@/components/shared/table-row-actions"
import { UserSelection } from "@/components/shared/user-selection"
import { usePermissions } from "@/hooks/use-permissions"
import { useNarrowViewport } from "@/hooks/use-narrow-viewport"
import { useList } from "@/hooks/api/useList"
import { useMutationApi } from "@/hooks/api/useMutationApi"
import { fetcher } from "@/lib/api/fetcher"
import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS } from "@/lib/api/api-endpoints"
import { queryKeys } from "@/hooks/api/queryKeys"
import { CrmLeadDTO, CrmMetricsData } from "@/services/crmService"


import {
  CRMLead,
  CRMLeadDrawer,
  LeadStage,
  STAGE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  ViewLeadModal,
  LogActivityModal,
  TaskItem,
  TaskFormModal,
  TasksQueueList,
  DateScheduleDrawer,
  PipelineKanbanBoard,
  CRMKpiCards,
} from "@/components/crm"

export default function CRMPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions("/dashboard/crm")
  const narrowViewport = useNarrowViewport(768)

  const userRole = (session?.user as any)?.role
  const currentUserId = (session?.user as any)?.id || session?.user?.id
  const isAdmin = ["C_ADMIN", "admin", "company"].includes(userRole || "")

  // Navigation Tabs & Filters
  const [activeTab, setActiveTab] = useState<string>("calendar")
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("ALL")
  const [serviceFilter, setServiceFilter] = useState<string>("ALL")
  const [userFilter, setUserFilter] = useState<string>("ALL")

  // Set default userFilter: "ALL" for Admin, logged-in user ID for Staff
  useEffect(() => {
    if (session?.user) {
      if (!isAdmin && currentUserId) {
        setUserFilter(String(currentUserId))
      } else {
        setUserFilter("ALL")
      }
    }
  }, [session, isAdmin, currentUserId])

  // Selected Date Drawer state for Calendar View
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false)

  // Lead Modals & Drawers
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | "view">("add")
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)

  // Task Form & Delete State
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null)

  // ── Standardized TanStack Query Hooks ──
  const { data: leadsResponse, isLoading: isLoadingLeads, refetch: refetchLeads } = useList<CrmLeadDTO[]>(
    ENDPOINTS.CRM.LEADS.KEY,
    ENDPOINTS.CRM.LEADS.URL,
    {
      search: search || undefined,
      stage: stageFilter !== "ALL" ? stageFilter : undefined,
      service: serviceFilter !== "ALL" ? serviceFilter : undefined,
      assignedTo: userFilter !== "ALL" ? userFilter : undefined,
    }
  )

  const { data: metricsResponse, refetch: refetchMetrics } = useQuery({
    queryKey: [ENDPOINTS.CRM.METRICS.KEY, "stats"],
    queryFn: () => fetcher<CrmMetricsData>(ENDPOINTS.CRM.METRICS.URL),
  })

  // Fetch users list using standardized hook
  const { data: employeesResponse } = useList<any>(
    ENDPOINTS.USERS.KEY,
    ENDPOINTS.USERS.URL
  )

  const employees = useMemo(() => {
    const raw = employeesResponse?.data as any
    if (Array.isArray(raw)) return raw.map((e: any) => ({ id: e._id || e.id, name: e.name }))
    if (raw && Array.isArray(raw.employees)) return raw.employees.map((e: any) => ({ id: e._id || e.id, name: e.name }))
    return []
  }, [employeesResponse])

  const createMutation = useMutationApi<CrmLeadDTO, Partial<CrmLeadDTO>>(
    ENDPOINTS.CRM.LEADS.URL,
    {
      method: "POST",
      invalidateKeys: [
        [...queryKeys.lists(), ENDPOINTS.CRM.LEADS.KEY],
        [...queryKeys.details(), ENDPOINTS.CRM.METRICS.KEY],
      ],
      successMessage: "Lead created successfully",
    }
  )

  const updateMutation = useMutationApi<CrmLeadDTO, Partial<CrmLeadDTO> & { id: string }>(
    ENDPOINTS.CRM.LEADS.URL,
    {
      method: "PUT",
      invalidateKeys: [
        [...queryKeys.lists(), ENDPOINTS.CRM.LEADS.KEY],
        [...queryKeys.details(), ENDPOINTS.CRM.METRICS.KEY],
      ],
      successMessage: "Lead updated successfully",
    }
  )

  const deleteMutation = useMutationApi<{ id: string; deleted: boolean }, { id: string }>(
    ENDPOINTS.CRM.LEADS.URL,
    {
      method: "DELETE",
      invalidateKeys: [
        [...queryKeys.lists(), ENDPOINTS.CRM.LEADS.KEY],
        [...queryKeys.details(), ENDPOINTS.CRM.METRICS.KEY],
      ],
      successMessage: "Lead deleted successfully",
    }
  )

  // DB Leads from TanStack Query
  const leads: CRMLead[] = useMemo(() => {
    const apiData = leadsResponse?.data
    if (Array.isArray(apiData)) return apiData as CRMLead[]
    return []
  }, [leadsResponse])

  // DB Tasks from TanStack Query
  const { data: tasksResponse, refetch: refetchTasks } = useList<TaskItem[]>(
    ENDPOINTS.CRM.TASKS.KEY,
    ENDPOINTS.CRM.TASKS.URL,
    {
      assignedTo: userFilter !== "ALL" ? userFilter : undefined,
    }
  )

  const tasks: TaskItem[] = useMemo(() => {
    const apiData = tasksResponse?.data
    if (Array.isArray(apiData)) return apiData as TaskItem[]
    return []
  }, [tasksResponse])

  const createTaskMutation = useMutationApi<TaskItem, Partial<TaskItem>>(
    ENDPOINTS.CRM.TASKS.URL,
    {
      method: "POST",
      invalidateKeys: [[...queryKeys.lists(), ENDPOINTS.CRM.TASKS.KEY]],
      successMessage: "Task scheduled successfully",
    }
  )

  const updateTaskMutation = useMutationApi<TaskItem, Partial<TaskItem> & { id: string }>(
    ENDPOINTS.CRM.TASKS.URL,
    {
      method: "PUT",
      invalidateKeys: [[...queryKeys.lists(), ENDPOINTS.CRM.TASKS.KEY]],
      successMessage: "Task updated successfully",
    }
  )

  const deleteTaskMutation = useMutationApi<{ id: string; deleted: boolean }, { id: string }>(
    ENDPOINTS.CRM.TASKS.URL,
    {
      method: "DELETE",
      invalidateKeys: [[...queryKeys.lists(), ENDPOINTS.CRM.TASKS.KEY]],
      successMessage: "Task deleted successfully",
    }
  )

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      const matchSearch =
        !q ||
        l.clientName.toLowerCase().includes(q) ||
        l.mobile.includes(q) ||
        l.destination.toLowerCase().includes(q)

      const matchStage = stageFilter === "ALL" || l.stage === stageFilter
      const matchService = serviceFilter === "ALL" || l.serviceType === serviceFilter
      const matchUser =
        userFilter === "ALL" ||
        !userFilter ||
        l.assignedTo === userFilter ||
        l.assignedToId === userFilter

      return matchSearch && matchStage && matchService && matchUser
    })
  }, [leads, search, stageFilter, serviceFilter, userFilter])

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.clientName.toLowerCase().includes(q) ||
        t.mobile.includes(q)

      const matchUser =
        userFilter === "ALL" ||
        !userFilter ||
        t.assignedTo === userFilter ||
        t.assignedToId === userFilter

      return matchSearch && matchUser
    })
  }, [tasks, search, userFilter])

  // KPI Metrics Data
  const metrics: CrmMetricsData = useMemo(() => {
    if (metricsResponse?.data) {
      return metricsResponse.data
    }
    const totalPipelineValue = leads
      .filter((l) => l.stage !== "LOST" && l.stage !== "WON")
      .reduce((acc, l) => acc + (l.estimatedValue || 0), 0)
    const wonValue = leads
      .filter((l) => l.stage === "WON")
      .reduce((acc, l) => acc + (l.estimatedValue || 0), 0)
    const wonCount = leads.filter((l) => l.stage === "WON").length
    const totalCount = leads.length
    const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0
    const todayStr = dayjs().format("YYYY-MM-DD")
    const todayTasksCount = tasks.filter(
      (t) => t.dueDate && t.dueDate.startsWith(todayStr) && !t.completed
    ).length

    return {
      totalPipelineValue,
      wonValue,
      wonCount,
      activeCount: leads.filter((l) => l.stage !== "LOST" && l.stage !== "WON").length,
      conversionRate,
      todayTasksCount,
      totalCount,
    }
  }, [metricsResponse, leads, tasks])

  // Lead Modal Handlers
  const handleOpenAdd = () => {
    setSelectedLead(null)
    setDrawerMode("add")
    setDrawerOpen(true)
  }

  const handleOpenEdit = (lead: CRMLead) => {
    setSelectedLead(lead)
    setDrawerMode("edit")
    setDrawerOpen(true)
  }

  const handleOpenView = (lead: CRMLead) => {
    setSelectedLead(lead)
    setViewModalOpen(true)
  }

  const handleOpenLogCall = (lead: CRMLead) => {
    setSelectedLead(lead)
    setLogModalOpen(true)
  }

  const activeLead = useMemo(() => {
    if (!selectedLead) return null
    return leads.find((l) => l.id === selectedLead.id) || selectedLead
  }, [leads, selectedLead])

  const handleDeleteLead = async (id: string) => {
    await deleteMutation.mutateAsync({ id })
  }

  const handleSaveLead = async (payload: Partial<CRMLead>) => {
    if (drawerMode === "edit" && selectedLead) {
      await updateMutation.mutateAsync({ id: selectedLead.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  }

  const handleMoveStage = (leadId: string, newStage: LeadStage) => {
    updateMutation.mutate({ id: leadId, stage: newStage })
  }

  // Task Actions
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      updateTaskMutation.mutate({ id: taskId, completed: !task.completed })
    }
  }

  const handleOpenCreateTask = () => {
    setEditingTask(null)
    setTaskModalOpen(true)
  }

  const handleOpenEditTask = (task: TaskItem) => {
    setDateDrawerOpen(false)
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleDeleteTask = (task: TaskItem) => {
    setDateDrawerOpen(false)
    setTaskToDelete(task)
  }

  const handleOpenViewLeadFromDrawer = (lead: CRMLead) => {
    setDateDrawerOpen(false)
    handleOpenView(lead)
  }

  const handleSaveTask = async (values: any) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        ...values,
      })
    } else {
      await createTaskMutation.mutateAsync({
        ...values,
        completed: false,
      })
    }
    setEditingTask(null)
    setTaskModalOpen(false)
  }

  const handleConvertToInvoice = (lead: CRMLead) => {
    message.loading(`Preparing ${lead.serviceType.replace(/_/g, " ")} Invoice for ${lead.clientName}...`, 1)
    const params = new URLSearchParams({
      clientName: lead.clientName,
      mobile: lead.mobile,
      destination: lead.destination,
      paxAdults: String(lead.paxAdults),
      estimatedValue: String(lead.estimatedValue),
      notes: lead.notes || "",
    })
    const routeMap: Record<string, string> = {
      AIR_TICKET: "/dashboard/invoices-air-ticket/new",
      VISA: "/dashboard/invoices-visa/new",
      UMRAH: "/dashboard/invoices-group/new",
    }
    const route = routeMap[lead.serviceType] || "/dashboard/invoices/new"
    setTimeout(() => {
      router.push(`${route}?${params.toString()}`)
    }, 600)
  }

  // Calendar Cell Renderer
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD")
    const dayTasks = filteredTasks.filter((t) => t.dueDate.startsWith(dateStr) && !t.completed)
    const dayLeads = filteredLeads.filter((l) => l.nextFollowUp && l.nextFollowUp.startsWith(dateStr))

    if (dayTasks.length === 0 && dayLeads.length === 0) return null

    return (
      <div className="space-y-1 mt-1">
        {dayTasks.slice(0, 2).map((t) => (
          <div
            key={t.id}
            className="text-[10px] truncate bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold border border-purple-100 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="truncate">{t.clientName}</span>
          </div>
        ))}
        {dayLeads.slice(0, 2).map((l) => (
          <div
            key={l.id}
            className="text-[10px] truncate bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-semibold border border-sky-100 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
            <span className="truncate">Follow-up: {l.clientName}</span>
          </div>
        ))}
        {dayTasks.length + dayLeads.length > 2 && (
          <span className="text-[9px] font-bold text-slate-400 block text-right">
            +{dayTasks.length + dayLeads.length - 2} more
          </span>
        )}
      </div>
    )
  }

  // Day Schedule Tasks for Drawer
  const selectedDateStr = selectedDate.format("YYYY-MM-DD")
  const selectedDayTasks = filteredTasks.filter((t) => t.dueDate.startsWith(selectedDateStr))
  const selectedDayLeads = filteredLeads.filter((l) => l.nextFollowUp && l.nextFollowUp.startsWith(selectedDateStr))

  // Table Columns
  const columns: ColumnsType<CRMLead> = [
    {
      title: "SL",
      key: "sl",
      width: 50,
      align: "center",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Client Contact",
      key: "client",
      width: 220,
      render: (_, r) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span>{r.clientName}</span>
            {r.priority === "HIGH" && <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
            {r.source === "WALK_IN" && <Tag color="orange" className="text-[9px] border-none px-1 py-0 m-0">Walk-in</Tag>}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Phone className="h-3 w-3 text-slate-400" /> {r.mobile}
          </div>
        </div>
      ),
    },
    {
      title: "Service & Destination",
      key: "service",
      width: 210,
      render: (_, r) => {
        const s = SERVICE_TYPE_OPTIONS.find((x) => x.value === r.serviceType)
        return (
          <div className="space-y-1">
            <Tag color="blue" className="text-[11px] font-semibold border-none bg-sky-50 text-sky-700">
              {s?.icon} {s?.label}
            </Tag>
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Compass className="h-3 w-3 text-slate-400" /> {r.destination} ({r.paxAdults} Pax)
            </div>
          </div>
        )
      },
    },
    {
      title: "Est. Value",
      dataIndex: "estimatedValue",
      key: "value",
      width: 130,
      render: (val: number) => (
        <span className="font-extrabold text-sky-700 text-xs">৳ {val?.toLocaleString()}</span>
      ),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      width: 140,
      render: (stage: LeadStage, r) => {
        const st = STAGE_OPTIONS.find((x) => x.value === stage)
        return (
          <Dropdown
            menu={{
              items: STAGE_OPTIONS.map((s) => ({
                key: s.value,
                label: s.label,
                onClick: () => handleMoveStage(r.id, s.value),
              })),
            }}
          >
            <Tag color={st?.color} className="cursor-pointer px-2 py-0.5 text-xs font-semibold rounded uppercase">
              {st?.label} ▾
            </Tag>
          </Dropdown>
        )
      },
    },
    {
      title: "Assigned Staff",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 140,
      render: (staff: string) => (
        <span className="text-xs font-semibold text-slate-700">{staff || "Unassigned"}</span>
      ),
    },
    {
      title: "Follow-up",
      dataIndex: "nextFollowUp",
      key: "followUp",
      width: 160,
      render: (date: string) => (
        <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded">
          {date || "Not scheduled"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: narrowViewport ? 64 : 220,
      align: narrowViewport ? "center" : undefined,
      render: (_, r) => (
        <TableRowActions
          compact={narrowViewport}
          onView={() => handleOpenView(r)}
          onEdit={() => handleOpenEdit(r)}
          onDelete={() => handleDeleteLead(r.id)}
          deleteTitle="Delete Lead"
          deleteDescription={`Are you sure you want to delete lead for ${r.clientName}?`}
          permissionPrefix="/dashboard/crm"
        />
      ),
    },
  ]

  return (
    <PageWrapper breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Travel CRM Workspace" }]}>
      <div className="space-y-6">
        {/* KPI Cards Strip */}
        <CRMKpiCards metrics={metrics} />

        {/* Filter Toolbar */}
        <FilterToolbar
          showSearch
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search client, phone, destination..."
          showRefresh
          onRefresh={() => {
            setSearch("")
            setStageFilter("ALL")
            setServiceFilter("ALL")
            setUserFilter(!isAdmin && currentUserId ? String(currentUserId) : "ALL")
            refetchLeads()
            refetchMetrics()
            refetchTasks()
          }}
          filterExtrasBefore={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={stageFilter}
                onChange={setStageFilter}
                className="w-36"
                options={[
                  { value: "ALL", label: "All Stages" },
                  ...STAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
                ]}
              />
              <Select
                value={serviceFilter}
                onChange={setServiceFilter}
                className="w-40"
                options={[
                  { value: "ALL", label: "All Services" },
                  ...SERVICE_TYPE_OPTIONS.map((s) => ({ value: s.value, label: `${s.icon} ${s.label}` })),
                ]}
              />
              <UserSelection
                value={userFilter === "ALL" ? "" : userFilter}
                onChange={(val) => setUserFilter(val || "ALL")}
                placeholder="User"
                className="w-48"
              />
            </div>
          }
        >
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenCreateTask}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Clock className="h-4 w-4 mr-1.5 text-purple-600" /> Schedule Task
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white border-none shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Lead
          </Button>
        </FilterToolbar>

        {/* 4 Workspace Views */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          items={[
            {
              key: "calendar",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs">
                  <CalendarIcon className="h-4 w-4 text-purple-600" /> Calendar Schedule
                </span>
              ),
              children: (
                <div className="pt-2">
                  <Calendar
                    dateCellRender={dateCellRender}
                    onSelect={(date, info) => {
                      if (!info || info.source === "date") {
                        setSelectedDate(date)
                        setDateDrawerOpen(true)
                      }
                    }}
                  />
                </div>
              ),
            },
            {
              key: "board",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs">
                  <LayoutGrid className="h-4 w-4 text-sky-600" /> Pipeline Kanban
                </span>
              ),
              children: (
                <PipelineKanbanBoard
                  leads={filteredLeads}
                  onOpenView={handleOpenView}
                  onMoveStage={handleMoveStage}
                />
              ),
            },
            {
              key: "tasks",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckSquare className="h-4 w-4 text-emerald-600" /> Tasks Queue
                  {filteredTasks.filter((t) => !t.completed).length > 0 && (
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      {filteredTasks.filter((t) => !t.completed).length}
                    </span>
                  )}
                </span>
              ),
              children: (
                <TasksQueueList
                  tasks={filteredTasks}
                  canDelete={canDelete}
                  onToggle={handleToggleTask}
                  onEdit={handleOpenEditTask}
                  onDelete={handleDeleteTask}
                  onScheduleTask={handleOpenCreateTask}
                />
              ),
            },
            {
              key: "table",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs">
                  <List className="h-4 w-4 text-slate-600" /> Leads List
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {filteredLeads.length}
                  </span>
                </span>
              ),
              children: (
                <div className="pt-2">
                  <Table
                    columns={columns}
                    dataSource={filteredLeads}
                    rowKey="id"
                    loading={isLoadingLeads}
                    scroll={{ x: 1200 }}
                    pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} leads` }}
                  />
                </div>
              ),
            },
          ]}
        />

        {/* Selected Date Schedule Drawer */}
        <DateScheduleDrawer
          open={dateDrawerOpen}
          onClose={() => setDateDrawerOpen(false)}
          selectedDate={selectedDate}
          tasks={selectedDayTasks}
          leads={selectedDayLeads}
          canDelete={canDelete}
          onToggleTask={handleToggleTask}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handleDeleteTask}
          onViewLead={handleOpenViewLeadFromDrawer}
        />

        {/* Schedule / Edit Task Modal */}
        <TaskFormModal
          open={taskModalOpen}
          onOpenChange={(open) => {
            setTaskModalOpen(open)
            if (!open) setEditingTask(null)
          }}
          task={editingTask}
          onSubmit={handleSaveTask}
          loading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />

        {/* Delete Confirmation Dialog matching money-receipts standard */}
        <ConfirmationDialog
          open={!!taskToDelete}
          onOpenChange={(open) => !open && setTaskToDelete(null)}
          title="Delete Scheduled Task"
          description={`Are you sure you want to delete task "${taskToDelete?.title}" for client ${taskToDelete?.clientName}? This cannot be undone.`}
          confirmText="Delete"
          onConfirm={async (e) => {
            e.preventDefault()
            if (taskToDelete) {
              await deleteTaskMutation.mutateAsync({ id: taskToDelete.id })
              setTaskToDelete(null)
            }
          }}
          isLoading={deleteTaskMutation.isPending}
          loadingText="Deleting..."
          variant="destructive"
        />

        {/* CRM Lead Drawer (Form) */}
        <CRMLeadDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          mode={drawerMode}
          lead={activeLead}
          employees={employees}
          onSubmit={handleSaveLead}
        />

        {/* View Lead Modal */}
        <ViewLeadModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          lead={activeLead}
          onEdit={(lead) => handleOpenEdit(lead)}
          onLogCall={(lead) => handleOpenLogCall(lead)}
          onConvertToInvoice={(lead) => handleConvertToInvoice(lead)}
        />

        {/* Log Activity Modal */}
        <LogActivityModal
          open={logModalOpen}
          onOpenChange={setLogModalOpen}
          lead={activeLead}
        />
      </div>
    </PageWrapper>
  )
}
