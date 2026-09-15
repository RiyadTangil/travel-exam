import { Schema, model, models, Types } from "mongoose"

const ExamResultSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    passportNumber: { type: String, required: true, trim: true, index: true },
    password: { type: String, trim: true, default: "" },
    result: { type: String, required: true, trim: true }, // e.g. "14 / 15"
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
  },
  {
    timestamps: true, // provides createdAt for "তারিখ ও সময়"
    collection: "exam_results",
  }
)

ExamResultSchema.index({ companyId: 1, createdAt: -1 })

export const ExamResult = models.ExamResult || model("ExamResult", ExamResultSchema)
export default ExamResult
