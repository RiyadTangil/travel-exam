import mongoose from "mongoose"
import { connectMongoose } from "@/lib/mongoose"
import { hashPassword, generateVerificationToken, normalizeEmail, emailEqualsNormalized } from "@/lib/auth"
import { User } from "@/models/user"
import { Company } from "@/models/company"
import { Role } from "@/models/role"
import { AppError } from "@/errors/AppError"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, incrementRateLimit } from "./rateLimitService"

const AUTH_LIMIT_CONFIG = {
  points: 10,         // 10 attempts
  duration: 60 * 5, // 5 minutes
  actionName: "login"
}

export async function authorizeUser(credentials: { email?: string; password?: string }, ip?: string) {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  await connectMongoose()

  const emailNorm = normalizeEmail(credentials.email)
  const ipKey = `login:ip:${ip || "unknown"}`
  const emailKey = `login:email:${emailNorm}`

  // Check rate limits
  await checkRateLimit(ipKey, AUTH_LIMIT_CONFIG)
  await checkRateLimit(emailKey, AUTH_LIMIT_CONFIG)

  // Find user (case-insensitive vs stored email)
  const user = await User.findOne(emailEqualsNormalized(emailNorm))
  
  if (!user) {
    // Increment rate limit on failure
    await incrementRateLimit(ipKey, AUTH_LIMIT_CONFIG)
    await incrementRateLimit(emailKey, AUTH_LIMIT_CONFIG)
    return null
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw new Error("Please verify your email before signing in")
  }

  // Check if user is active
  if (user.status === "inactive") {
    throw new Error("Your account is inactive. Please contact support.")
  }

  // Verify password
  const { verifyPassword } = await import("@/lib/auth")
  const isValidPassword = await verifyPassword(credentials.password, user.password)

  if (!isValidPassword) {
    // Increment rate limit on failure
    await incrementRateLimit(ipKey, AUTH_LIMIT_CONFIG)
    await incrementRateLimit(emailKey, AUTH_LIMIT_CONFIG)
    return null
  }

  // If user has a companyId, fetch it
  let companyData = null
  if (user.companyId) {
    companyData = await Company.findOne({ _id: user.companyId })
  }

  let subscriptionEndDate = undefined;
  if (companyData) {
    subscriptionEndDate = companyData.subscription?.status === 'trial' 
      ? companyData.subscription?.trialEndDate?.toISOString()
      : companyData.subscription?.currentPeriodEnd?.toISOString();
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    userType: user.userType,
    roleId: user.roleId ? user.roleId.toString() : undefined,
    companyId: user.companyId ? user.companyId.toString() : undefined,
    companyName: companyData?.name || undefined,
    companyLogoUrl: companyData?.logoUrl || undefined,
    companyStatus: companyData?.status || "active",
    subscriptionEndDate: subscriptionEndDate,
  }
}

export async function register(data: {
  name: string
  email: string
  password: string
  companyName: string
  companyEmail?: string
  companyMobile?: string
  companyAddress: string
  logoUrl?: string | null
}) {
  await connectMongoose()
  
  const emailNorm = normalizeEmail(data.email)
  const companyEmailNorm = normalizeEmail(data.companyEmail || data.email)

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Check if user already exists
    const existingUser = await User.findOne(emailEqualsNormalized(emailNorm)).session(session)
    if (existingUser) {
      throw new AppError("User already exists", 400)
    }

    // Check if company email already exists
    const existingCompany = await Company.findOne(emailEqualsNormalized(companyEmailNorm)).session(session)
    if (existingCompany) {
      throw new AppError("Company with this email already exists", 400)
    }

    // Hash password and generate verification token
    const hashedPassword = await hashPassword(data.password)
    const verificationToken = generateVerificationToken()

    // Pre-generate ObjectIDs to satisfy schema validation requirements
    const userId = new mongoose.Types.ObjectId()
    const companyId = new mongoose.Types.ObjectId()
    const roleId = new mongoose.Types.ObjectId()

    // Create user
    const [user] = await User.create([{
      _id: userId,
      email: emailNorm,
      password: hashedPassword,
      name: data.name,
      role: "C_ADMIN", 
      userType: "TENANT",
      companyId: companyId,
      roleId: roleId,
      isVerified: false,
      verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], { session })

    // Calculate trial period
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 30)

    // Create company
    const [company] = await Company.create([{
      _id: companyId,
      name: data.companyName,
      email: companyEmailNorm,
      mobileNumber: data.companyMobile || "0000000000",
      address: data.companyAddress,
      logoUrl: data.logoUrl,
      ownerId: userId,
      subscription: {
        status: "trial",
        trialStartDate,
        trialEndDate,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }], { session })

    // Create default role
    const [ownerRole] = await Role.create([{
      _id: roleId,
      name: "Company Administrator",
      roleType: "C_ADMIN",
      companyId: companyId,
      permissions: ["perm-all"],
      isDefault: true,
      developer: false,
      status: "active",
    }], { session })

    await session.commitTransaction()

    // Send verification email
    try {
      await sendVerificationEmail(emailNorm, verificationToken)
    } catch (err) {
      console.error("Failed to send verification email:", err)
    }

    return {
      userId: userId,
      companyId: company._id,
    }
  } catch (error: any) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

export async function verifyEmail(token: string) {
  await connectMongoose()

  const user = await User.findOne({ verificationToken: token })
  if (!user) {
    throw new AppError("Invalid or expired verification token", 400)
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
      $unset: {
        verificationToken: "",
      },
    }
  )

  return true
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  await connectMongoose()

  const user = await User.findById(userId)
  if (!user) {
    throw new AppError("User account not found", 404)
  }

  const { verifyPassword } = await import("@/lib/auth")
  const isValid = await verifyPassword(currentPassword, user.password)
  if (!isValid) {
    throw new AppError("Current password is incorrect", 400)
  }

  const hashedPassword = await hashPassword(newPassword)
  await User.updateOne(
    { _id: user._id },
    { $set: { password: hashedPassword, updatedAt: new Date() } }
  )

  return true
}

export async function forgotPassword(email: string) {
  await connectMongoose()
  const emailNorm = normalizeEmail(email)

  const user = await User.findOne(emailEqualsNormalized(emailNorm))
  if (!user) return null

  const { generateResetToken } = await import("@/lib/auth")
  const resetToken = generateResetToken()
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
        updatedAt: new Date(),
      },
    }
  )

  const { sendPasswordResetEmail } = await import("@/lib/email")
  await sendPasswordResetEmail(user.email, resetToken)
  return true
}

export async function resetPassword(token: string, password: string) {
  await connectMongoose()

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  })

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400)
  }

  const hashedPassword = await hashPassword(password)
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      $unset: {
        resetPasswordToken: "",
        resetPasswordExpires: "",
      },
    }
  )

  return true
}

