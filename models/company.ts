import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const CompanySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  logoUrl: { type: String },
  ownerId: { type: Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["active", "suspended", "inactive"],
    default: "active",
  },
  subscription: {
    status: { type: String, enum: ["trial", "active", "expired", "canceled"], default: "trial" },
    trialStartDate: { type: Date, default: Date.now },
    trialEndDate: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
}, { 
  ...baseSchemaOptions,
  collection: "companies" 
})

export const Company = models.Company || model("Company", CompanySchema)
