import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

export interface ICrmLead {
  _id: Types.ObjectId
  companyId: Types.ObjectId
  clientName: string
  mobile: string
  email?: string
  service: number
  dest: string
  paxAdult?: number
  paxChild?: number
  val: number
  stage: number
  priority: number
  source: number
  assignedTo?: Types.ObjectId | string
  travelDate?: Date
  nextFollowUp?: Date
  notes?: string
  createdBy?: Types.ObjectId
  updatedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CrmLeadSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true },
    service: { type: Number, required: true, index: true },
    dest: { type: String, required: true, trim: true },
    paxAdult: { type: Number },
    paxChild: { type: Number },
    val: { type: Number, required: true },
    stage: { type: Number, required: true, default: 1, index: true },
    priority: { type: Number, required: true, default: 1, index: true },
    source: { type: Number, required: true, default: 1, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    travelDate: { type: Date },
    nextFollowUp: { type: Date, index: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  {
    ...baseSchemaOptions,
    collection: "crm_leads",
  }
)

// Compound indexes for common filter queries
CrmLeadSchema.index({ companyId: 1, stage: 1, createdAt: -1 })
CrmLeadSchema.index({ companyId: 1, nextFollowUp: 1 })
CrmLeadSchema.index({ companyId: 1, assignedTo: 1 })

export const CrmLead = models.CrmLead || model("CrmLead", CrmLeadSchema)
export default CrmLead
