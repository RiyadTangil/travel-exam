import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { badRequest } from "@/utils/api-response"
import * as examResultController from "@/controllers/examResultController"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  return examResultController.getExamResultMetrics(companyId)
}
