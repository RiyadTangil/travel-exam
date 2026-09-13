import { type NextRequest } from "next/server"
import { ok, badRequest, fail } from "@/utils/api-response"
import { isAppError } from "@/errors/AppError"
import { 
  register, 
  verifyEmail, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} from "@/services/authService"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { checkRateLimit, incrementRateLimit, getClientIp } from "@/services/rateLimitService"

// Rate limit configurations
const SIGNUP_LIMIT = { points: 10, duration: 900, actionName: "signup" }
const VERIFY_LIMIT = { points: 10, duration: 900, actionName: "verification" }
const PASSWORD_LIMIT = { points: 5, duration: 900, actionName: "password change" }
const FORGOT_LIMIT = { points: 5, duration: 900, actionName: "forgot password" }
const RESET_LIMIT = { points: 5, duration: 900, actionName: "password reset" }

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(1, "Agency Name is required"),
  companyEmail: z.string().email("Invalid company email").optional(),
  companyMobile: z.string().optional(),
  companyAddress: z.string().min(1, "Agency Address is required"),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number"),
})

export async function signup(request: NextRequest) {
  const ip = getClientIp(request)
  let email = ""
  try {
    const formData = await request.formData()
    email = formData.get("email") as string

    if (email) {
      await checkRateLimit(`signup:ip:${ip}`, SIGNUP_LIMIT)
      await checkRateLimit(`signup:email:${email}`, SIGNUP_LIMIT)
    }

    const body = {
      name: formData.get("name") as string,
      email: email,
      password: formData.get("password") as string,
      companyName: formData.get("companyName") as string,
      companyEmail: formData.get("companyEmail") as string || undefined,
      companyMobile: formData.get("companyMobile") as string || undefined,
      companyAddress: formData.get("companyAddress") as string,
    }

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return fail({ 
        error: "validation_error", 
        message: "Invalid input data",
        details: parsed.error.flatten().fieldErrors 
      }, 400)
    }

    const companyLogo = formData.get("companyLogo") as File | null
    let logoUrl = null
    if (companyLogo) {
      logoUrl = `/uploads/logos/${Date.now()}-${companyLogo.name}`
    }

    const result = await register({
      ...parsed.data,
      logoUrl
    })

    return ok(result, 201, "Registration successful. Please check your email to verify your account.")
  } catch (e: any) {
    if (email) {
      await incrementRateLimit(`signup:ip:${ip}`, SIGNUP_LIMIT)
      await incrementRateLimit(`signup:email:${email}`, SIGNUP_LIMIT)
    }
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("authController.signup error:", e)
    return fail("Internal server error", 500)
  }
}

export async function verify(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    await checkRateLimit(`verify:ip:${ip}`, VERIFY_LIMIT)

    const { token } = await request.json()
    if (!token) {
      return badRequest("Verification token is required")
    }

    await verifyEmail(token)
    return ok({}, 200, "Email verified successfully")
  } catch (e: any) {
    await incrementRateLimit(`verify:ip:${ip}`, VERIFY_LIMIT)
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("authController.verify error:", e)
    return fail("Internal server error", 500)
  }
}

export async function updatePassword(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.id) {
      return fail("Unauthorized. Please sign in again.", 401)
    }

    await checkRateLimit(`password:ip:${ip}`, PASSWORD_LIMIT)
    await checkRateLimit(`password:user:${session.user.id}`, PASSWORD_LIMIT)

    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[] | undefined> = parsed.error.flatten().fieldErrors
      const firstField = Object.keys(fieldErrors)[0]
      const message = fieldErrors[firstField]?.[0] || "Invalid input data"
      return fail({ message, field: firstField }, 400)
    }

    const { currentPassword, newPassword } = parsed.data
    if (currentPassword === newPassword) {
      return fail({ message: "New password must be different from the current password", field: "newPassword" }, 400)
    }

    await changePassword(session.user.id, currentPassword, newPassword)
    return ok(null, 200, "Password changed successfully")
  } catch (e: any) {
    await incrementRateLimit(`password:ip:${ip}`, PASSWORD_LIMIT)
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("authController.updatePassword error:", e)
    return fail("Internal server error", 500)
  }
}

export async function requestPasswordReset(request: NextRequest) {
  const ip = getClientIp(request)
  let email = ""
  try {
    const body = await request.json()
    email = body.email

    if (!email) return badRequest("Email is required")

    await checkRateLimit(`forgot:ip:${ip}`, FORGOT_LIMIT)
    await checkRateLimit(`forgot:email:${email}`, FORGOT_LIMIT)

    await forgotPassword(email)
    
    // Always return success to prevent email enumeration
    return ok({}, 200, "If an account with that email exists, we have sent a password reset link.")
  } catch (e: any) {
    if (email) {
      await incrementRateLimit(`forgot:ip:${ip}`, FORGOT_LIMIT)
      await incrementRateLimit(`forgot:email:${email}`, FORGOT_LIMIT)
    }
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("authController.requestPasswordReset error:", e)
    return fail("Internal server error", 500)
  }
}

export async function performPasswordReset(request: NextRequest) {
  const ip = getClientIp(request)
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return badRequest("Token and password are required")
    }

    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters")
    }

    await checkRateLimit(`reset:ip:${ip}`, RESET_LIMIT)

    await resetPassword(token, password)
    return ok({}, 200, "Password reset successfully")
  } catch (e: any) {
    await incrementRateLimit(`reset:ip:${ip}`, RESET_LIMIT)
    if (isAppError(e)) return fail({ error: e.code || "error", message: e.message }, e.status)
    console.error("authController.performPasswordReset error:", e)
    return fail("Internal server error", 500)
  }
}
