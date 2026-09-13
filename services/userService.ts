import connectMongoose from "@/lib/mongoose"
import { User } from "@/models/user"
import { isValidObjectId, Types } from "mongoose"
import { AppError } from "@/errors/AppError"
import { isBossRole, getSameRoleUserIds } from "@/services/crmService"

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

  // Non-admin users only see users in their same role group
  if (!isBossRole(params.userRole) && params.userId && isValidObjectId(params.userId) && params.companyId) {
    const sameRoleUserIds = await getSameRoleUserIds(String(params.companyId), params.userId)
    filter._id = { $in: sameRoleUserIds }
  }

  const search = (params.search || "").trim()
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { userName: { $regex: search, $options: "i" } },
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
    .populate("roleId", "name")
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
    mobile: i.mobile || "—",
    roleId: i.roleId?._id ? String(i.roleId._id) : null,
    roleName: i.roleId?.name || "—",
    createdAt: i.createdAt,
    status: i.status,
  }))

  return { items, total, page, pageSize }
}

export async function createUser(data: any) {
  await connectMongoose()

  // Case-insensitive email check
  const existingUser = await User.findOne({ 
    email: { $regex: `^${data.email}$`, $options: "i" } 
  })
  if (existingUser) {
    throw new AppError("Email already exists", 400)
  }

  const newUser = await User.create({
    ...data,
    isVerified: true, // Auto-verify users created by admin
  })

  const populated = await User.findById(newUser._id).populate("roleId", "name").lean()
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
