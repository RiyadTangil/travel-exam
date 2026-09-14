import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { badRequest } from "@/utils/api-response"
import * as questionController from "@/controllers/questionController"

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const resolvedParams = await context.params
  const id = resolvedParams.id
  const body = await request.json()
  return questionController.updateCategory(id, body, companyId, session?.user?.id)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const resolvedParams = await context.params
  const id = resolvedParams.id
  return questionController.deleteCategory(id, companyId)
}
