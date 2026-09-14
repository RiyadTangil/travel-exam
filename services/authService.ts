import mongoose from "mongoose"
import { connectMongoose } from "@/lib/mongoose"
import { hashPassword, generateVerificationToken, normalizeEmail, emailEqualsNormalized } from "@/lib/auth"
import { User } from "@/models/user"
import { Company } from "@/models/company"
import { AppError } from "@/errors/AppError"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, incrementRateLimit } from "./rateLimitService"

const AUTH_LIMIT_CONFIG = {
  points: 10,         // 10 attempts
  duration: 60 * 5, // 5 minutes
  actionName: "login"
}

export async function authorizeUser(
  credentials: { identifier?: string; email?: string; password?: string },
  ip?: string
) {
  const rawInput = (credentials?.identifier || credentials?.email || "").trim()
  const password = credentials?.password

  if (!rawInput || !password) {
    return null
  }

  await connectMongoose()

  const { verifyPassword } = await import("@/lib/auth")
  const passportCandidate = rawInput.replace(/[\s-]/g, "").toUpperCase()
  const escapedInput = rawInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const exactRegex = new RegExp(`^${escapedInput}$`, "i")

  const ipKey = `login:ip:${ip || "unknown"}`
  const identifierKey = `login:id:${rawInput.toLowerCase()}`

  // Check rate limits
  await checkRateLimit(ipKey, AUTH_LIMIT_CONFIG)
  await checkRateLimit(identifierKey, AUTH_LIMIT_CONFIG)

  // Smart multi-field matcher: Email, Clean Passport, Original Passport, Name, UserName
  const queryConditions: any[] = [
    { email: exactRegex },
    { passportNumberClean: passportCandidate },
    { passportNumber: exactRegex },
    { name: exactRegex },
    { userName: exactRegex },
  ]

  // Find candidate users matching any of the criteria
  const matchingUsers = await User.find({
    $or: queryConditions
  })

  if (!matchingUsers || matchingUsers.length === 0) {
    await incrementRateLimit(ipKey, AUTH_LIMIT_CONFIG)
    await incrementRateLimit(identifierKey, AUTH_LIMIT_CONFIG)
    return null
  }

  // If single match or multiple matches (e.g. identical names), find the one with matching password
  let authenticatedUser: any = null
  for (const u of matchingUsers) {
    const isValid = await verifyPassword(password, u.password)
    if (isValid) {
      authenticatedUser = u
      break
    }
  }

  if (!authenticatedUser) {
    await incrementRateLimit(ipKey, AUTH_LIMIT_CONFIG)
    await incrementRateLimit(identifierKey, AUTH_LIMIT_CONFIG)
    return null
  }

  // Check if candidate/user is active
  if (authenticatedUser.status === "inactive") {
    throw new Error("Your account is inactive. Please contact support.")
  }

  // Non-candidates must be email-verified; candidates are verified by agency author
  const isCandidate = authenticatedUser.role === "CANDIDATE"
  if (!isCandidate && !authenticatedUser.isVerified) {
    throw new Error("Please verify your email before signing in")
  }

  // Fetch company details if applicable
  let companyData = null
  if (authenticatedUser.companyId) {
    companyData = await Company.findOne({ _id: authenticatedUser.companyId })
  }

  let subscriptionEndDate = undefined
  if (companyData) {
    subscriptionEndDate =
      companyData.subscription?.status === "trial"
        ? companyData.subscription?.trialEndDate?.toISOString()
        : companyData.subscription?.currentPeriodEnd?.toISOString()
  }

  return {
    id: authenticatedUser._id.toString(),
    name: authenticatedUser.name,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    userType: authenticatedUser.userType,
    passportNumber: authenticatedUser.passportNumber || undefined,
    targetCountry: authenticatedUser.targetCountry || undefined,
    trade: authenticatedUser.trade || undefined,
    examStatus: authenticatedUser.examStatus || "PENDING",
    roleId: authenticatedUser.roleId ? authenticatedUser.roleId.toString() : undefined,
    companyId: authenticatedUser.companyId ? authenticatedUser.companyId.toString() : undefined,
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

