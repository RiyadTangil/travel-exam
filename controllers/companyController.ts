import { listAdminCompanies, updateAdminCompany } from "@/services/companyService"
import { ok, fail, badRequest } from "@/utils/api-response"
import { isValidObjectId } from "mongoose"

export async function listCompanies(searchParams: URLSearchParams) {
  try {
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)
    const search = (searchParams.get("search") || "").trim()

    const result = await listAdminCompanies({ page, limit, search })
    return ok(result)
  } catch (error: any) {
    return fail(error)
  }
}

export async function updateCompany(id: string, body: any) {
  try {
    if (!id || !isValidObjectId(id)) {
      return badRequest("Invalid company ID")
    }
    const updated = await updateAdminCompany(id, body)
    if (!updated) {
      return fail("Company not found", 404)
    }
    return ok({ updated: true }, 200, "Company updated successfully")
  } catch (error: any) {
    return fail(error)
  }
}
