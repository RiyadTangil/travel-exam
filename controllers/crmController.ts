import { type NextRequest } from "next/server"
import {
  listCrmLeads,
  createCrmLead,
  getCrmLeadById,
  updateCrmLead,
  deleteCrmLead,
  getCrmMetrics,
} from "@/services/crmService"
import { ok, fail, badRequest, notFound } from "@/utils/api-response"
import { getBackendSession } from "@/lib/auth-server"

// GET /api/crm/leads
export async function listCrmLeadsHandler(request: NextRequest) {
  try {
    const { companyId, userId, session } = await getBackendSession()
    const userRole = (session?.user as any)?.role
    const sp = request.nextUrl.searchParams

    const page = Number(sp.get("page") || 1)
    const limit = Number(sp.get("limit") || 50)
    const search = sp.get("search") || ""
    const stage = sp.get("stage") || undefined
    const priority = sp.get("priority") || undefined
    const service = sp.get("service") || undefined
    const assignedTo = sp.get("assignedTo") || undefined

    const result = await listCrmLeads({ companyId, userId, userRole, page, limit, search, stage, priority, service, assignedTo })
    return ok(result.data, 200, "Leads retrieved successfully", result.meta)
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// POST /api/crm/leads
export async function createCrmLeadHandler(request: NextRequest) {
  try {
    const { companyId, userId } = await getBackendSession()
    const body = await request.json()

    if (!body.clientName || !body.mobile || !body.serviceType || !body.destination || body.estimatedValue === undefined) {
      return badRequest("Missing required fields: clientName, mobile, serviceType, destination, estimatedValue")
    }

    const lead = await createCrmLead(body, companyId, userId)
    return ok(lead, 201, "Travel lead created successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// GET /api/crm/leads/[id]
export async function getCrmLeadByIdHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { companyId } = await getBackendSession()

    const lead = await getCrmLeadById(id, companyId)
    if (!lead) {
      return notFound("Travel lead not found")
    }
    return ok(lead, 200, "Lead details retrieved")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// PUT /api/crm/leads/[id]
export async function updateCrmLeadHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { companyId, userId } = await getBackendSession()
    const body = await request.json()

    const updated = await updateCrmLead(id, body, companyId, userId)
    if (!updated) {
      return notFound("Travel lead not found or update failed")
    }
    return ok(updated, 200, "Lead updated successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// DELETE /api/crm/leads/[id]
export async function deleteCrmLeadHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { companyId } = await getBackendSession()

    const success = await deleteCrmLead(id, companyId)
    if (!success) {
      return notFound("Travel lead not found or already deleted")
    }
    return ok({ id, deleted: true }, 200, "Lead deleted successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// GET /api/crm/metrics
export async function getCrmMetricsHandler(request: NextRequest) {
  try {
    const { companyId, userId, session } = await getBackendSession()
    const userRole = (session?.user as any)?.role
    const metrics = await getCrmMetrics(companyId, userId, userRole)
    return ok(metrics, 200, "CRM metrics retrieved successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}
