import { ok, badRequest, fail, notFound } from "@/utils/api-response"
import * as examResultService from "@/services/examResultService"
import { isValidObjectId } from "mongoose"

export async function saveExamResult(body: any, companyId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }

    if (!body?.name || !body?.passportNumber || !body?.result) {
      return badRequest("নাম, পাসপোর্ট নম্বর ও ফলাফল আবশ্যক / Name, passport number, and result are required")
    }

    const saved = await examResultService.saveResult(companyId, {
      name: body.name,
      passportNumber: body.passportNumber,
      password: body.password || body.passportNumber,
      result: body.result, // e.g. "14 / 15"
    })

    return ok(saved, 201, "পরীক্ষার ফলাফল সংরক্ষিত হয়েছে / Result saved successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function listExamResults(
  companyId: string,
  search?: string,
  page?: string | number,
  limit?: string | number
) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }

    const data = await examResultService.listResults(companyId, {
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    })

    return ok(data)
  } catch (error: any) {
    return fail(error)
  }
}

export async function clearAllExamResults(companyId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }

    const result = await examResultService.clearAllResults(companyId)
    return ok(result, 200, "সকল ফলাফল সফলভাবে মুছে ফেলা হয়েছে / All results cleared successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function deleteExamResult(companyId: string, resultId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }
    if (!resultId || !isValidObjectId(resultId)) {
      return badRequest("Valid Result ID is required")
    }

    const deleted = await examResultService.deleteResult(companyId, resultId)
    if (!deleted) {
      return notFound("Exam result not found")
    }

    return ok(deleted, 200, "ফলাফল মুছে ফেলা হয়েছে / Result deleted successfully")
  } catch (error: any) {
    return fail(error)
  }
}

export async function getExamResultMetrics(companyId: string) {
  try {
    if (!companyId || !isValidObjectId(companyId)) {
      return badRequest("Valid Company ID is required")
    }

    const total = await examResultService.getPassedCount(companyId)
    return ok({ total })
  } catch (error: any) {
    return fail(error)
  }
}
