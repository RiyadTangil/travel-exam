import { NextRequest } from "next/server"
import { list, create } from "@/controllers/userController"
import { badRequest } from "@/utils/api-response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const pageSize = Number(searchParams.get("pageSize") || 100)
  const search = searchParams.get("search") || ""

  return list({ page, pageSize, search, companyId, userRole: "CANDIDATE" })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const body = await request.json()
  return create({ ...body, userRole: "CANDIDATE" }, companyId)
}
