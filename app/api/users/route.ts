import { list } from "@/controllers/userController"
import { getBackendSession } from "@/lib/auth-server"

export async function GET(request: Request) {
  const { companyId, userId, session } = await getBackendSession()
  const userRole = (session?.user as any)?.role
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const selection = searchParams.get("selection") === "true"
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 20)

  return list({ page, pageSize: limit, search, companyId, selection, userId, userRole })
}
