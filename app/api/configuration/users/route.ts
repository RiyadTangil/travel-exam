import { NextRequest } from "next/server"
import { list, create } from "@/controllers/userController"
import { badRequest } from "@/utils/api-response"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = request.headers.get("x-company-id")
  if (!companyId) return badRequest("Company ID required")

  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 20)
  const search = searchParams.get("search") || ""
  const fromDate = searchParams.get("fromDate") || undefined
  const toDate = searchParams.get("toDate") || undefined

  return list({ page, pageSize, search, fromDate, toDate, companyId })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const companyId = request.headers.get("x-company-id")
  if (!companyId) return badRequest("Company ID required")

  return create(body, companyId)
}
