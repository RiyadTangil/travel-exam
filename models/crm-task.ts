import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

export interface ICrmTask {
  _id: Types.ObjectId
  companyId: Types.ObjectId
  clientName: string
  mobile?: string
  title: string
  dueDate: Date
  assignedTo?: Types.ObjectId
  category: "WALK_IN_FOLLOWUP" | "VISA_EXPIRY" | "PASSPORT_EXPIRY" | "PRE_DEPARTURE" | "GENERAL_CALL"
  priority: "HIGH" | "MEDIUM" | "LOW"
  completed: boolean
  leadId?: Types.ObjectId
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CrmTaskSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, default: "" },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    category: { type: Number, required: true, default: 5, index: true },
    priority: { type: Number, required: true, default: 1, index: true },
    completed: { type: Boolean, default: false, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "CrmLead", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  {
    ...baseSchemaOptions,
    collection: "crm_tasks",
  }
)

CrmTaskSchema.index({ companyId: 1, dueDate: 1 })
CrmTaskSchema.index({ companyId: 1, assignedTo: 1 })

export const CrmTask = models.CrmTask || model("CrmTask", CrmTaskSchema)
export default CrmTask
