import connectMongoose from "@/lib/mongoose"
import { ExamResult } from "@/models/exam-result"
import { Types } from "mongoose"

export interface SaveExamResultPayload {
  name: string
  passportNumber: string
  password?: string
  result: string // e.g. "14 / 15"
}

export async function saveResult(
  companyId: string,
  payload: SaveExamResultPayload
) {
  await connectMongoose()

  return ExamResult.create({
    name: payload.name.trim(),
    passportNumber: (payload.passportNumber || "").trim(),
    password: (payload.password || "").trim(),
    result: payload.result.trim(),
    companyId: new Types.ObjectId(companyId),
  })
}

export async function listResults(
  companyId: string,
  options: { search?: string; page?: number; limit?: number } = {}
) {
  await connectMongoose()

  const page = Math.max(1, Number(options.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20))
  const skip = (page - 1) * limit

  const query: any = {
    companyId: new Types.ObjectId(companyId),
  }

  if (options.search && options.search.trim()) {
    const regex = new RegExp(options.search.trim(), "i")
    query.$or = [
      { name: regex },
      { passportNumber: regex },
      { password: regex },
    ]
  }

  const [items, total] = await Promise.all([
    ExamResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ExamResult.countDocuments(query),
  ])

  return {
    items: items.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      passportNumber: doc.passportNumber,
      password: doc.password,
      result: doc.result,
      createdAt: doc.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function clearAllResults(companyId: string) {
  await connectMongoose()
  const res = await ExamResult.deleteMany({ companyId: new Types.ObjectId(companyId) })
  return { deletedCount: res.deletedCount }
}

export async function deleteResult(companyId: string, resultId: string) {
  await connectMongoose()
  return ExamResult.findOneAndDelete({
    _id: new Types.ObjectId(resultId),
    companyId: new Types.ObjectId(companyId),
  })
}

export async function getPassedCount(companyId: string) {
  await connectMongoose()
  return ExamResult.countDocuments({ companyId: new Types.ObjectId(companyId) })
}
