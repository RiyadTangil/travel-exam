import { type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { listCompanies } from "@/controllers/companyController"
import { fail } from "@/utils/api-response"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key"

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
  if (!token) return fail("Unauthorized", 401)
  if (token.userType !== "PLATFORM") return fail("Forbidden", 403)

  const { searchParams } = new URL(request.url)
  return listCompanies(searchParams)
}