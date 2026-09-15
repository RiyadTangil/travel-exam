import { Question } from "@/models/question"
import { QuestionCategory } from "@/models/question-category"
import connectMongoose from "@/lib/mongoose"
import { Types } from "mongoose"

const DEFAULT_CATEGORIES = [
  { name: "সাধারণ ও নিরাপত্তা", color: "#1B64F2", code: "SAFETY" },
  { name: "ড্রাইভিং ও ট্রাফিক নিয়ম", color: "#10B981", code: "DRIVING" },
  { name: "ইলেকট্রিক্যাল ও ওয়্যারিং", color: "#F59E0B", code: "ELECTRICAL" },
  { name: "ওয়েল্ডিং ও মেটাল", color: "#8B5CF6", code: "WELDING" },
  { name: "মৌলিক ভাষা দক্ষতা", color: "#EC4899", code: "LANGUAGE" },
]

export async function listCategories(companyId: string) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(companyId)

  let categories = await QuestionCategory.find({
    companyId: companyOid,
    status: { $ne: "inactive" },
  })
    .sort({ createdAt: 1 })
    .lean()

  // Pre-seed default categories if company has none yet
  if (categories.length === 0) {
    const seedDocs = DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      code: c.code,
      color: c.color,
      companyId: companyOid,
      status: "active",
    }))
    await QuestionCategory.insertMany(seedDocs)
    categories = await QuestionCategory.find({
      companyId: companyOid,
      status: { $ne: "inactive" },
    })
      .sort({ createdAt: 1 })
      .lean()
  }

  // Count questions per category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const questionCount = await Question.countDocuments({
        companyId: companyOid,
        categoryId: cat._id,
        status: { $ne: "inactive" },
      })
      return {
        id: String(cat._id),
        name: (cat.name || "").split("/")[0].trim(),
        code: cat.code || "",
        description: cat.description || "",
        color: cat.color || "#1B64F2",
        status: cat.status,
        questionCount,
        createdAt: cat.createdAt,
      }
    })
  )

  return categoriesWithCounts
}

export async function createCategory(
  data: { name: string; description?: string; color?: string; companyId: string },
  userId?: string
) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(data.companyId)
  const userOid = userId ? new Types.ObjectId(userId) : undefined

  const category = await QuestionCategory.create({
    name: data.name.trim(),
    description: data.description?.trim(),
    color: data.color || "#1B64F2",
    companyId: companyOid,
    status: "active",
    createdBy: userOid,
    updatedBy: userOid,
  })

  return {
    id: String(category._id),
    name: category.name,
    color: category.color,
    description: category.description,
    status: category.status,
    questionCount: 0,
  }
}

export async function updateCategory(
  id: string,
  companyId: string,
  data: { name?: string; description?: string; color?: string },
  userId?: string
) {
  await connectMongoose()
  const catOid = new Types.ObjectId(id)
  const companyOid = new Types.ObjectId(companyId)

  const update: any = { updatedBy: userId ? new Types.ObjectId(userId) : undefined }
  if (data.name) update.name = data.name.trim()
  if (data.description !== undefined) update.description = data.description.trim()
  if (data.color) update.color = data.color

  const updated = await QuestionCategory.findOneAndUpdate(
    { _id: catOid, companyId: companyOid },
    { $set: update },
    { new: true }
  ).lean()

  if (updated && data.name) {
    // Update cached category name in questions
    await Question.updateMany(
      { categoryId: catOid, companyId: companyOid },
      { $set: { categoryName: data.name.trim() } }
    )
  }

  return updated
}

export async function deleteCategory(id: string, companyId: string) {
  await connectMongoose()
  const catOid = new Types.ObjectId(id)
  const companyOid = new Types.ObjectId(companyId)

  // Check if questions are attached
  const qCount = await Question.countDocuments({
    categoryId: catOid,
    companyId: companyOid,
    status: { $ne: "inactive" },
  })

  if (qCount > 0) {
    throw new Error(
      `এই ক্যাটাগরিতে ${qCount} টি প্রশ্ন সংযুক্ত রয়েছে। প্রথমে প্রশ্নগুলো মুছে ফেলুন বা অন্য ক্যাটাগরিতে সরান। / Cannot delete category containing ${qCount} questions.`
    )
  }

  await QuestionCategory.deleteOne({ _id: catOid, companyId: companyOid })
  return { success: true }
}

export interface ListQuestionsParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  difficulty?: string
}

export async function listQuestions(companyId: string, params: ListQuestionsParams) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(companyId)
  const page = Math.max(1, params.page || 1)
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 20))
  const skip = (page - 1) * pageSize

  const query: any = {
    companyId: companyOid,
    status: { $ne: "inactive" },
  }

  if (params.categoryId && params.categoryId !== "all") {
    query.categoryId = new Types.ObjectId(params.categoryId)
  }

  if (params.difficulty && params.difficulty !== "all") {
    query.difficulty = params.difficulty
  }

  if (params.search) {
    const term = params.search.trim()
    query.$or = [
      { questionText: { $regex: term, $options: "i" } },
      { "options.text": { $regex: term, $options: "i" } },
    ]
  }

  const [total, items] = await Promise.all([
    Question.countDocuments(query),
    Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ])

  const mapped = items.map((q: any) => ({
    id: String(q._id),
    categoryId: String(q.categoryId),
    categoryName: (q.categoryName || "সাধারণ").split("/")[0].trim(),
    questionText: q.questionText,
    type: q.type || "MCQ",
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    marks: q.marks || 1,
    explanation: q.explanation || "",
    difficulty: q.difficulty || "medium",
    status: q.status || "active",
    createdAt: q.createdAt,
  }))

  return {
    items: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function createQuestion(
  data: {
    companyId: string
    categoryId: string
    questionText: string
    type?: string
    options: Array<{ key: string; text: string }>
    correctAnswer: string
    marks?: number
    explanation?: string
    difficulty?: string
  },
  userId?: string
) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(data.companyId)
  const categoryOid = new Types.ObjectId(data.categoryId)
  const userOid = userId ? new Types.ObjectId(userId) : undefined

  // Find category to cache its name
  const category: any = await QuestionCategory.findById(categoryOid).lean()
  const categoryName = category?.name || "General"

  const question = await Question.create({
    companyId: companyOid,
    categoryId: categoryOid,
    categoryName,
    questionText: data.questionText.trim(),
    type: data.type || "MCQ",
    options: data.options.map((opt) => ({
      key: opt.key.toUpperCase().trim(),
      text: opt.text.trim(),
    })),
    correctAnswer: data.correctAnswer.toUpperCase().trim(),
    marks: data.marks || 1,
    explanation: data.explanation?.trim() || "",
    difficulty: data.difficulty || "medium",
    status: "active",
    createdBy: userOid,
    updatedBy: userOid,
  })

  return {
    id: String(question._id),
    categoryId: String(question.categoryId),
    categoryName: question.categoryName,
    questionText: question.questionText,
    type: question.type,
    options: question.options,
    correctAnswer: question.correctAnswer,
    marks: question.marks,
    explanation: question.explanation,
    difficulty: question.difficulty,
    createdAt: question.createdAt,
  }
}

export async function updateQuestion(
  id: string,
  companyId: string,
  data: {
    categoryId?: string
    questionText?: string
    options?: Array<{ key: string; text: string }>
    correctAnswer?: string
    marks?: number
    explanation?: string
    difficulty?: string
    status?: string
  },
  userId?: string
) {
  await connectMongoose()
  const questionOid = new Types.ObjectId(id)
  const companyOid = new Types.ObjectId(companyId)

  const update: any = { updatedBy: userId ? new Types.ObjectId(userId) : undefined }

  if (data.categoryId) {
    const catOid = new Types.ObjectId(data.categoryId)
    update.categoryId = catOid
    const cat: any = await QuestionCategory.findById(catOid).lean()
    if (cat) update.categoryName = cat.name
  }

  if (data.questionText) update.questionText = data.questionText.trim()
  if (data.options) {
    update.options = data.options.map((opt) => ({
      key: opt.key.toUpperCase().trim(),
      text: opt.text.trim(),
    }))
  }
  if (data.correctAnswer) update.correctAnswer = data.correctAnswer.toUpperCase().trim()
  if (data.marks !== undefined) update.marks = Number(data.marks) || 1
  if (data.explanation !== undefined) update.explanation = data.explanation.trim()
  if (data.difficulty) update.difficulty = data.difficulty
  if (data.status) update.status = data.status

  const updated = await Question.findOneAndUpdate(
    { _id: questionOid, companyId: companyOid },
    { $set: update },
    { new: true }
  ).lean()

  return updated
}

export async function deleteQuestion(id: string, companyId: string) {
  await connectMongoose()
  const questionOid = new Types.ObjectId(id)
  const companyOid = new Types.ObjectId(companyId)

  await Question.deleteOne({ _id: questionOid, companyId: companyOid })
  return { success: true }
}

export async function getQuestionStats(companyId: string) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(companyId)

  const [totalQuestions, totalCategories, marksAgg] = await Promise.all([
    Question.countDocuments({ companyId: companyOid, status: { $ne: "inactive" } }),
    QuestionCategory.countDocuments({ companyId: companyOid, status: { $ne: "inactive" } }),
    Question.aggregate([
      { $match: { companyId: companyOid, status: { $ne: "inactive" } } },
      { $group: { _id: null, totalMarks: { $sum: "$marks" } } },
    ]),
  ])

  const totalMarks = marksAgg[0]?.totalMarks || 0

  return {
    totalQuestions,
    totalCategories,
    totalMarks,
  }
}
