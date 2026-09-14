import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  passportNumber: { type: String, trim: true, sparse: true, index: true },
  passportNumberClean: { type: String, trim: true, uppercase: true, sparse: true, index: true },
  targetCountry: { type: String, trim: true },
  trade: { type: String, trim: true },
  examStatus: { 
    type: String, 
    enum: ["PENDING", "IN_PROGRESS", "PASSED", "FAILED"], 
    default: "PENDING" 
  },
  role: { 
    type: String, 
    enum: [
      "P_SADMIN", 
      "P_ADMIN", 
      "C_ADMIN", 
      "CANDIDATE"
    ], 
    default: "CANDIDATE" 
  },
  userType: { type: String, enum: ["PLATFORM", "TENANT"], default: "TENANT", required: true },
  companyId: { type: Types.ObjectId, ref: "Company", required: true },
  isVerified: { type: Boolean, default: true },
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