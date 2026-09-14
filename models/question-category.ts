import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const QuestionCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    color: { type: String, default: "#1B64F2" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    ...baseSchemaOptions,
    collection: "question_categories",
  }
)

export const QuestionCategory =
  models.QuestionCategory || model("QuestionCategory", QuestionCategorySchema)
