import { type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { updateCompany } from "@/controllers/companyController"
import { fail } from "@/utils/api-response"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
  if (!token) return fail("Unauthorized", 401)
  if (token.userType !== "PLATFORM") return fail("Forbidden", 403)

  const body = await request.json()
  return updateCompany(params.id, body)
}