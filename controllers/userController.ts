import { ok, badRequest, fail, notFound } from "@/utils/api-response"
import { isAppError } from "@/errors/AppError"
import { listUsers, createUser, getUserById, updateUserById, deleteUserById } from "@/services/userService"
import { z } from "zod"
import { hashPassword } from "@/lib/auth"
import { Types } from "mongoose"

const userSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  userEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  passportNumber: z.string().optional().or(z.literal("")),
  targetCountry: z.string().optional().or(z.literal("")),
  trade: z.string().optional().or(z.literal("")),
  examStatus: z.enum(["PENDING", "IN_PROGRESS", "PASSED", "FAILED"]).optional(),
  userName: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
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
    passportNumber: u.passportNumber || "—",
    targetCountry: u.targetCountry || "—",
    trade: u.trade || "—",
    examStatus: u.examStatus || "PENDING",
    mobile: u.mobile || "—",
    roleName: u.role === "CANDIDATE" ? "Candidate" : "Agency Staff",
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

    const {
      fullName,
      userEmail,
      passportNumber,
      targetCountry,
      trade,
      examStatus,
      userName,
      password,
      mobile,
      userRole,
      roleId,
      status,
    } = parsed.data

    const cleanPassport = passportNumber ? passportNumber.replace(/[\s-]/g, "").toUpperCase() : ""

    // Candidate or user email handling
    let finalEmail = (userEmail || "").trim()
    if (!finalEmail) {
      if (cleanPassport) {
        finalEmail = `${cleanPassport.toLowerCase()}@candidate.travelexam.internal`
      } else {
        return badRequest("Email is required when Passport Number is not provided")
      }
    }

    // Password handling: default to passport number or require
    let rawPassword = (password || "").trim()
    if (!rawPassword) {
      if (cleanPassport && cleanPassport.length >= 6) {
        rawPassword = cleanPassport
      } else {
        rawPassword = "Exam@" + (cleanPassport || "123456")
      }
    }

    const hashedPassword = await hashPassword(rawPassword)

    const userData: any = {
      name: fullName,
      email: finalEmail,
      userName: userName || (cleanPassport ? cleanPassport.toLowerCase() : undefined),
      password: hashedPassword,
      passportNumber: passportNumber ? passportNumber.trim() : undefined,
      passportNumberClean: cleanPassport || undefined,
      targetCountry: targetCountry ? targetCountry.trim() : undefined,
      trade: trade ? trade.trim() : undefined,
      examStatus: examStatus || "PENDING",
      mobile,
      role: userRole || "CANDIDATE",
      userType: "TENANT",
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
    if (body.mobile !== undefined) data.mobile = body.mobile
    if (body.userRole) data.role = body.userRole
    if (body.passportNumber !== undefined) {
      data.passportNumber = body.passportNumber.trim()
      data.passportNumberClean = body.passportNumber.replace(/[\s-]/g, "").toUpperCase()
    }
    if (body.targetCountry !== undefined) data.targetCountry = body.targetCountry
    if (body.trade !== undefined) data.trade = body.trade
    if (body.examStatus !== undefined) data.examStatus = body.examStatus
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
