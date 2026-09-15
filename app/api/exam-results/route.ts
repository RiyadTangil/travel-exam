import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { badRequest } from "@/utils/api-response"
import * as examResultController from "@/controllers/examResultController"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || undefined
  const page = searchParams.get("page") || 1
  const limit = searchParams.get("limit") || searchParams.get("pageSize") || 20

  return examResultController.listExamResults(companyId, search, page, limit)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const body = await request.json()
  return examResultController.saveExamResult(body, companyId)
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    return examResultController.deleteExamResult(companyId, id)
  }

  return examResultController.clearAllExamResults(companyId)
}
