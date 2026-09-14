import { ok, badRequest, fail, notFound } from "@/utils/api-response"
import * as questionService from "@/services/questionService"
import { isValidObjectId } from "mongoose"

export async function listCategories(companyId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    const categories = await questionService.listCategories(companyId)
    return ok(categories)
  } catch (error: any) {
    return fail(error)
  }
}

export async function createCategory(body: any, companyId: string, userId?: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    if (!body?.name || !body.name.trim()) {
      return badRequest("ক্যাটাগরির নাম দেওয়া আবশ্যক / Category name is required")
    }
    const created = await questionService.createCategory(
      {
        name: body.name,
        description: body.description,
        color: body.color,
        companyId,
      },
      userId
    )
    return ok(created, 201, "Category created successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function updateCategory(id: string, body: any, companyId: string, userId?: string) {
  try {
    if (!id || !isValidObjectId(id) || !companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid IDs are required")
    }
    const updated = await questionService.updateCategory(id, companyId, body, userId)
    if (!updated) {
      return notFound("Category not found")
    }
    return ok(updated, 200, "Category updated successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function deleteCategory(id: string, companyId: string) {
  try {
    if (!id || !isValidObjectId(id) || !companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid IDs are required")
    }
    await questionService.deleteCategory(id, companyId)
    return ok({ deleted: true }, 200, "Category deleted successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function listQuestions(companyId: string, searchParams: URLSearchParams) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    const page = Number(searchParams.get("page") || 1)
    const pageSize = Number(searchParams.get("pageSize") || 20)
    const search = searchParams.get("search") || undefined
    const categoryId = searchParams.get("categoryId") || undefined
    const difficulty = searchParams.get("difficulty") || undefined

    const result = await questionService.listQuestions(companyId, {
      page,
      pageSize,
      search,
      categoryId,
      difficulty,
    })

    return ok(result.items, 200, "Questions fetched successfully", {
      total: result.total,
      page: result.page,
      limit: result.pageSize,
    })
  } catch (error: any) {
    return fail(error)
  }
}

export async function createQuestion(body: any, companyId: string, userId?: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    if (!body?.questionText || !body.questionText.trim()) {
      return badRequest("প্রশ্নের বিবরণ আবশ্যক / Question text is required")
    }
    if (!body?.categoryId || !isValidObjectId(body.categoryId)) {
      return badRequest("ক্যাটাগরি নির্বাচন করুন / Please select a category")
    }
    if (!Array.isArray(body?.options) || body.options.length < 2) {
      return badRequest("কমপক্ষে ২টি উত্তর অপশন আবশ্যক / At least 2 options are required")
    }
    const hasEmptyOption = body.options.some((o: any) => !o.text || !o.text.trim())
    if (hasEmptyOption) {
      return badRequest("সকল অপশনের টেক্সট পূরণ করুন / All options must have text")
    }
    if (!body?.correctAnswer) {
      return badRequest("সঠিক উত্তর নির্বাচন করুন / Please select the correct answer")
    }

    const created = await questionService.createQuestion(
      {
        companyId,
        categoryId: body.categoryId,
        questionText: body.questionText,
        type: body.type || "MCQ",
        options: body.options,
        correctAnswer: body.correctAnswer,
        marks: Number(body.marks) || 1,
        explanation: body.explanation,
        difficulty: body.difficulty || "medium",
      },
      userId
    )

    return ok(created, 201, "Question created successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function updateQuestion(id: string, body: any, companyId: string, userId?: string) {
  try {
    if (!id || !isValidObjectId(id) || !companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid IDs are required")
    }
    const updated = await questionService.updateQuestion(id, companyId, body, userId)
    if (!updated) {
      return notFound("Question not found")
    }
    return ok(updated, 200, "Question updated successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function deleteQuestion(id: string, companyId: string) {
  try {
    if (!id || !isValidObjectId(id) || !companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid IDs are required")
    }
    await questionService.deleteQuestion(id, companyId)
    return ok({ deleted: true }, 200, "Question deleted successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function getQuestionStats(companyId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    const stats = await questionService.getQuestionStats(companyId)
    return ok(stats)
  } catch (error: any) {
    return fail(error)
  }
}
