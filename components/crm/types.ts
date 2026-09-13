import type { CRMLead, LeadStage, LeadPriority, ServiceType, LeadSource } from "./crm-drawer"

export type TaskCategory =
  | "WALK_IN_FOLLOWUP"
  | "VISA_EXPIRY"
  | "PASSPORT_EXPIRY"
  | "PRE_DEPARTURE"
  | "GENERAL_CALL"

export type TaskItem = {
  id: string
  leadId?: string
  clientName: string
  mobile: string
  title: string
  dueDate: string
  assignedTo: string
  assignedToId?: string
  category: TaskCategory
  priority: "HIGH" | "MEDIUM" | "LOW"
  completed: boolean
}

export const TASK_CATEGORY_OPTIONS = [
  { value: "GENERAL_CALL", label: "📞 General Call" },
  { value: "WALK_IN_FOLLOWUP", label: "🚶 Walk-in Follow-up" },
  { value: "VISA_EXPIRY", label: "📄 Visa Expiry" },
  { value: "PASSPORT_EXPIRY", label: "🛂 Passport Expiry" },
  { value: "PRE_DEPARTURE", label: "🛫 Pre-Departure" },
]

export const TASK_PRIORITY_OPTIONS = [
  { value: "HIGH", label: "🔥 High / Urgent" },
  { value: "MEDIUM", label: "⚡ Medium" },
  { value: "LOW", label: "🔹 Low" },
]

export type { CRMLead, LeadStage, LeadPriority, ServiceType, LeadSource }
export type { CrmMetricsData } from "@/services/crmService"
