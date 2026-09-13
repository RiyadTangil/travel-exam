import { type NextRequest } from "next/server"
import {
  listCrmTasks,
  createCrmTask,
  updateCrmTask,
  deleteCrmTask,
} from "@/services/crmTaskService"
import { ok, fail, badRequest, notFound } from "@/utils/api-response"
import { getBackendSession } from "@/lib/auth-server"

// GET /api/crm/tasks
export async function listCrmTasksHandler(request: NextRequest) {
  try {
    const { companyId, userId, session } = await getBackendSession()
    const userRole = (session?.user as any)?.role
    const sp = request.nextUrl.searchParams
    const assignedTo = sp.get("assignedTo") || undefined
    const tasks = await listCrmTasks({ companyId, userId, userRole, assignedTo })
    return ok(tasks, 200, "CRM tasks retrieved successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// POST /api/crm/tasks
export async function createCrmTaskHandler(request: NextRequest) {
  try {
    const { companyId, userId } = await getBackendSession()
    const body = await request.json()

    if (!body.title || !body.clientName) {
      return badRequest("Missing required fields: title, clientName")
    }

    const task = await createCrmTask(body, companyId, userId)
    return ok(task, 201, "Task scheduled successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// PUT /api/crm/tasks/[id]
export async function updateCrmTaskHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { companyId, userId } = await getBackendSession()
    const body = await request.json()

    const updated = await updateCrmTask(id, body, companyId, userId)
    if (!updated) {
      return notFound("Task not found or update failed")
    }
    return ok(updated, 200, "Task updated successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}

// DELETE /api/crm/tasks/[id]
export async function deleteCrmTaskHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { companyId } = await getBackendSession()

    const success = await deleteCrmTask(id, companyId)
    if (!success) {
      return notFound("Task not found or already deleted")
    }
    return ok({ id, deleted: true }, 200, "Task deleted successfully")
  } catch (err: any) {
    return fail(err, err?.statusCode || 500)
  }
}
