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
    const rawOptions = Array.isArray(body?.options) ? body.options : []
    const cleanOptions = rawOptions
      .filter((o: any) => typeof o?.text === "string" && o.text.trim().length > 0)
      .map((o: any, idx: number) => ({
        key: String.fromCharCode(65 + idx),
        text: o.text.trim(),
      }))

    if (cleanOptions.length < 2) {
      return badRequest("কমপক্ষে ২টি উত্তর অপশন পূরণ করুন / At least 2 options are required")
    }

    // Ensure correctAnswer is valid
    let validCorrectAnswer = (body?.correctAnswer || "A").toUpperCase().trim()
    const origSelected = rawOptions.find((o: any) => (o?.key || "").toUpperCase().trim() === validCorrectAnswer)
    const matched = cleanOptions.find((o: any) => o.text === origSelected?.text?.trim())
    if (matched) {
      validCorrectAnswer = matched.key
    } else if (!cleanOptions.some((o: any) => o.key === validCorrectAnswer)) {
      validCorrectAnswer = cleanOptions[0].key
    }

    const created = await questionService.createQuestion(
      {
        companyId,
        categoryId: body.categoryId,
        questionText: body.questionText,
        imageUrl: body.imageUrl,
        imageKey: body.imageKey,
        type: body.type || "MCQ",
        options: cleanOptions,
        correctAnswer: validCorrectAnswer,
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

    const updateData = { ...body }
    if (Array.isArray(body?.options)) {
      const cleanOptions = body.options
        .filter((o: any) => typeof o?.text === "string" && o.text.trim().length > 0)
        .map((o: any, idx: number) => ({
          key: String.fromCharCode(65 + idx),
          text: o.text.trim(),
        }))

      if (cleanOptions.length < 2) {
        return badRequest("কমপক্ষে ২টি উত্তর অপশন পূরণ করুন / At least 2 options are required")
      }
      updateData.options = cleanOptions
      if (body.correctAnswer) {
        const origSelected = body.options.find(
          (o: any) => (o?.key || "").toUpperCase().trim() === body.correctAnswer.toUpperCase().trim()
        )
        const matched = cleanOptions.find((o: any) => o.text === origSelected?.text?.trim())
        updateData.correctAnswer = matched ? matched.key : cleanOptions[0].key
      }
    }

    const updated = await questionService.updateQuestion(id, companyId, updateData, userId)
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

export async function reorderQuestions(companyId: string, items: Array<{ id: string; order: number }>, userId?: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("Items array is required")
    }
    const result = await questionService.reorderQuestions(companyId, items, userId)
    return ok(result, 200, "Questions reordered successfully")
  } catch (error: any) {
    return fail(error)
  }
}
