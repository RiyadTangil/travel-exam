import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ok, badRequest, fail } from "@/utils/api-response"
import * as questionService from "@/services/questionService"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = session?.user?.companyId || request.headers.get("x-company-id")
    if (!companyId) {
      return badRequest("Unauthorized or Company ID required")
    }

    const body = await request.json()
    const { items } = body
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("Items array is required: [{ id, order }]")
    }

    const result = await questionService.reorderQuestions(
      companyId,
      items,
      session?.user?.id
    )

    return ok(result, 200, "Questions reordered successfully")
  } catch (error: any) {
    console.error("[Reorder API] Error:", error)
    return fail(error)
  }
}
