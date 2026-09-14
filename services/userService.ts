import connectMongoose from "@/lib/mongoose"
import { User } from "@/models/user"
import { isValidObjectId, Types } from "mongoose"
import { AppError } from "@/errors/AppError"

export async function listUsers(params: {
  page?: number
  pageSize?: number
  companyId?: string
  search?: string
  fromDate?: string
  toDate?: string
  userId?: string
  userRole?: string
}) {
  await connectMongoose()
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 20))

  const filter: any = {}
  if (params.companyId) {
    filter.companyId = isValidObjectId(params.companyId) ? new Types.ObjectId(params.companyId) : params.companyId
  }

  if (params.userRole) {
    filter.role = params.userRole
  }

  const search = (params.search || "").trim()
  if (search) {
    const cleanSearch = search.replace(/[\s-]/g, "")
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { userName: { $regex: search, $options: "i" } },
      { passportNumber: { $regex: search, $options: "i" } },
      { passportNumberClean: { $regex: cleanSearch, $options: "i" } },
      { targetCountry: { $regex: search, $options: "i" } },
      { trade: { $regex: search, $options: "i" } },
    ]
  }

  if (params.fromDate || params.toDate) {
    filter.createdAt = {}
    if (params.fromDate) filter.createdAt.$gte = new Date(params.fromDate)
    if (params.toDate) {
      const end = new Date(params.toDate)
      end.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = end
    }
  }

  const total = await User.countDocuments(filter)
  const docs = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean()

  const items = (docs || []).map((i: any) => ({
    id: String(i._id),
    userRole: i.role,
    fullName: i.name,
    userName: i.userName || "—",
    userEmail: i.email,
    passportNumber: i.passportNumber || "—",
    targetCountry: i.targetCountry || "—",
    trade: i.trade || "—",
    examStatus: i.examStatus || "PENDING",
    mobile: i.mobile || "—",
    roleId: i.roleId?._id ? String(i.roleId._id) : null,
    roleName: i.roleId?.name || (i.role === "CANDIDATE" ? "Candidate" : i.role || "—"),
    createdAt: i.createdAt,
    status: i.status,
  }))

  return { items, total, page, pageSize }
}

export async function createUser(data: any) {
  await connectMongoose()

  // Case-insensitive email check
  if (data.email) {
    const existingUser = await User.findOne({ 
      email: { $regex: `^${data.email}$`, $options: "i" } 
    })
    if (existingUser) {
      throw new AppError("Email already registered in system", 400)
    }
  }

  // Passport number duplicate check within the same company
  if (data.passportNumberClean) {
    const existingPassport = await User.findOne({
      companyId: data.companyId,
      passportNumberClean: data.passportNumberClean
    })
    if (existingPassport) {
      throw new AppError("A candidate with this passport number is already registered in your agency", 400)
    }
  }

  const newUser = await User.create({
    ...data,
    isVerified: true, // Auto-verify users/candidates created by agency author
  })

  const populated = await User.findById(newUser._id).lean()
  return populated
}

export async function getUserById(id: string, companyId?: string) {
  await connectMongoose()
  if (!isValidObjectId(id)) throw new AppError("Invalid user ID", 400)

  const filter: any = { _id: new Types.ObjectId(id) }
  if (companyId) {
    filter.companyId = isValidObjectId(companyId) ? new Types.ObjectId(companyId) : companyId
  }

  const user = await User.findOne(filter).populate("roleId", "name").lean()
  return user
}

export async function updateUserById(id: string, companyId: string, data: any) {
  await connectMongoose()
  if (!isValidObjectId(id)) throw new AppError("Invalid user ID", 400)

  // If email is being updated, check for case-insensitive uniqueness
  if (data.email) {
    const existingUser = await User.findOne({
      _id: { $ne: new Types.ObjectId(id) },
      email: { $regex: `^${data.email}$`, $options: "i" }
    })
    if (existingUser) {
      throw new AppError("Email already exists", 400)
    }
  }

  const filter: any = { _id: new Types.ObjectId(id), companyId: isValidObjectId(companyId) ? new Types.ObjectId(companyId) : companyId }
  const updatedUser = await User.findOneAndUpdate(filter, data, { new: true }).populate("roleId", "name").lean()
  
  return updatedUser
}

export async function deleteUserById(id: string, companyId: string, currentUserId: string) {
  await connectMongoose()
  if (!isValidObjectId(id)) throw new AppError("Invalid user ID", 400)

  if (currentUserId === id) {
    throw new AppError("You cannot delete your own account.", 400)
  }

  const filter: any = { _id: new Types.ObjectId(id), companyId: isValidObjectId(companyId) ? new Types.ObjectId(companyId) : companyId }
  const result = await User.deleteOne(filter)
  
  return result.deletedCount > 0
}
