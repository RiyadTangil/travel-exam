import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const RoleSchema = new Schema({
  name: { type: String, required: true },
  companyId: { type: Types.ObjectId, ref: "Company", index: true, required: true },
  permissions: [{ type: String }],
  isDefault: { type: Boolean, default: false },
  roleType: { 
    type: String, 
    enum: [
      "P_SADMIN", 
      "P_ADMIN", 
      "P_SUPP", 
      "P_MKTG", 
      "P_DEV", 
      "C_ADMIN", 
      "C_ACC", 
      "C_AGENT", 
      "C_EMP"
    ], 
    default: "C_EMP" 
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { 
  ...baseSchemaOptions,
  collection: "roles" 
})

if (process.env.NODE_ENV === "development" && models.Role) {
  delete models.Role
}

export const Role = models.Role || model("Role", RoleSchema)