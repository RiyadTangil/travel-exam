import { Schema, model, models, Types } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const OptionSchema = new Schema(
  {
    key: { type: String, required: true, uppercase: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const QuestionSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    categoryId: { type: Types.ObjectId, ref: "QuestionCategory", required: true, index: true },
    categoryName: { type: String, trim: true },
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["MCQ", "TRUE_FALSE"],
      default: "MCQ",
    },
    options: {
      type: [OptionSchema],
      validate: {
        validator: function (v: any[]) {
          return Array.isArray(v) && v.length >= 2
        },
        message: "A question must have at least 2 options",
      },
    },
    correctAnswer: { type: String, required: true, uppercase: true, trim: true },
    marks: { type: Number, default: 1, min: 1 },
    explanation: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
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
    collection: "questions",
  }
)

export const Question = models.Question || model("Question", QuestionSchema)
