import { ok, badRequest, fail, notFound } from "@/utils/api-response"
import { isAppError } from "@/errors/AppError"
import { listUsers, createUser, getUserById, updateUserById, deleteUserById } from "@/services/userService"
import { z } from "zod"
import { hashPassword } from "@/lib/auth"
import { Types } from "mongoose"

const userSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  userEmail: z.string().email("Invalid email"),
  userName: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  mobile: z.string().optional(),
  userRole: z.string().optional(),
  roleId: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  companyId: z.string().min(1, "Company ID is required"),
})

function mapUserResponse(u: any) {
  if (!u) return null
  return {
    id: String(u._id || u.id),
    userRole: u.role || u.userRole,
    fullName: u.name || u.fullName,
    userName: u.userName || "—",
    userEmail: u.email || u.userEmail,
    mobile: u.mobile || "—",
    roleId: u.roleId?._id || u.roleId || null,
    roleName: u.roleId?.name || u.roleName || "—",
    createdAt: u.createdAt,
    status: u.status,
  }
}

export async function list(params: {
  page?: number
  pageSize?: number
  companyId?: string
  search?: string
  fromDate?: string
  toDate?: string
  selection?: boolean
  userId?: string
  userRole?: string
}) {
  try {
    const { items, total, page, pageSize } = await listUsers(params)
    
    // If it's for selection, we might want a simpler format
    if (params.selection) {
      const selectionItems = items.map(i => ({
        id: i.id,
        name: i.fullName
      }))
      return ok(selectionItems, 200, "Success", {
        page,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      })
    }

    return ok({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (e: any) {
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("userController.list error:", e)
    return fail("Internal server error", 500)
  }
}

export async function create(body: any, companyId: string) {
  try {
    const parsed = userSchema.safeParse({ ...body, companyId })
    if (!parsed.success) {
      return fail({ error: "validation_error", message: JSON.stringify(parsed.error.flatten().fieldErrors) }, 400)
    }

    const { fullName, userEmail, userName, password, mobile, userRole, roleId, status } = parsed.data
    
    if (!password) return badRequest("Password is required for new users")
    const hashedPassword = await hashPassword(password)

    const userData = {
      name: fullName,
      email: userEmail,
      userName,
      password: hashedPassword,
      mobile,
      role: userRole || "C_EMP",
      userType: "TENANT", // Defaults to tenant for newly created users via controller
      roleId: roleId ? new Types.ObjectId(roleId) : null,
      status: status || "active",
      companyId: new Types.ObjectId(companyId),
    }

    const newUser = await createUser(userData)
    return ok(mapUserResponse(newUser))
  } catch (e: any) {
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("userController.create error:", e)
    return fail("Internal server error", 500)
  }
}

export async function getById(id: string, companyId?: string) {
  try {
    const user = await getUserById(id, companyId)
    if (!user) return notFound("User not found")
    return ok(mapUserResponse(user))
  } catch (e: any) {
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("userController.getById error:", e)
    return fail("Internal server error", 500)
  }
}

export async function update(id: string, body: any, companyId: string) {
  try {
    const updateSchema = userSchema.partial().omit({ companyId: true })
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return fail({ error: "validation_error", message: JSON.stringify(parsed.error.flatten().fieldErrors) }, 400)
    }

    const data: any = {}
    if (body.fullName) data.name = body.fullName
    if (body.userName) data.userName = body.userName
    if (body.userEmail) data.email = body.userEmail
    if (body.mobile) data.mobile = body.mobile
    if (body.userRole) data.role = body.userRole
    if (body.roleId !== undefined) data.roleId = body.roleId ? new Types.ObjectId(body.roleId) : null
    if (body.status) data.status = body.status
    if (body.password) {
      data.password = await hashPassword(body.password)
    }

    const updated = await updateUserById(id, companyId, data)
    if (!updated) return notFound("User not found")
    
    return ok(mapUserResponse(updated))
  } catch (e: any) {
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("userController.update error:", e)
    return fail("Internal server error", 500)
  }
}

export async function remove(id: string, companyId: string, currentUserId: string) {
  try {
    const success = await deleteUserById(id, companyId, currentUserId)
    if (!success) return notFound("User not found")
    return ok({ success: true })
  } catch (e: any) {
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("userController.remove error:", e)
    return fail("Internal server error", 500)
  }
}
