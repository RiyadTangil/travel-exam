import { NextRequest } from "next/server"
import { update, remove } from "@/controllers/userController"
import { badRequest } from "@/utils/api-response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const body = await request.json()
  const companyId = request.headers.get("x-company-id")

  if (!companyId) return badRequest("Company ID required")

  // Controller handles most logic, but "modify own account" check is often here or in controller
  // I'll keep it here for now as it uses session which is easily available in route
  if (session?.user?.id === id) {
    return badRequest("You cannot modify your own account. Please ask another administrator.")
  }

  return update(id, body, companyId)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const companyId = request.headers.get("x-company-id")

  if (!companyId) return badRequest("Company ID required")

  return remove(id, companyId, session?.user?.id || "")
}
