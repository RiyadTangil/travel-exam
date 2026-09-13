import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
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
  userType: { type: String, enum: ["PLATFORM", "TENANT"], default: "TENANT", required: true },
  roleId: { type: Types.ObjectId, ref: "Role" },
  companyId: { type: Types.ObjectId, ref: "Company", required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  mobile: { type: String },
  userName: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { 
  ...baseSchemaOptions,
  collection: "users" 
})

export const User = models.User || model("User", UserSchema)