import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ok, badRequest, fail } from "@/utils/api-response"
import * as questionService from "@/services/questionService"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = session?.user?.companyId || request.headers.get("x-company-id")
    if (!companyId) {
      return badRequest("Unauthorized or Company ID required")
    }

    const result = await questionService.seedRealCategoriesAndQuestions(
      companyId,
      session?.user?.id
    )

    return ok(result, 200, "রিয়েল ক্যাটাগরি এবং প্রশ্ন সফলভাবে যুক্ত হয়েছে / Real categories & questions loaded successfully")
  } catch (error: any) {
    console.error("[Seed API] Error:", error)
    return fail(error)
  }
}
