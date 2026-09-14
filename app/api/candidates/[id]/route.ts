import { NextRequest } from "next/server"
import { update, remove } from "@/controllers/userController"
import { badRequest } from "@/utils/api-response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const { id } = await params
  const body = await request.json()

  return update(id, body, companyId)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const companyId = session?.user?.companyId || request.headers.get("x-company-id")
  if (!companyId) return badRequest("Unauthorized or Company ID required")

  const { id } = await params
  return remove(id, companyId, session?.user?.id || "")
}
