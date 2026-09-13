import { Company } from "@/models/company"
import { User } from "@/models/user"
import { CrmLead } from "@/models/crm-lead"
import connectMongoose from "@/lib/mongoose"
import { Types } from "mongoose"

export interface ListAdminCompaniesParams {
  page?: number
  limit?: number
  search?: string
}

export async function listAdminCompanies(params: ListAdminCompaniesParams) {
  await connectMongoose()
  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, params.limit || 10)
  const search = (params.search || "").trim()
  const skip = (page - 1) * limit

  const query: any = {}
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ]
  }

  const total = await Company.countDocuments(query)
  const allCompanies = await Company.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const items = await Promise.all(
    allCompanies.map(async (company: any) => {
      const [userCount, lastLead] = await Promise.all([
        User.countDocuments({ companyId: company._id }),
        CrmLead.findOne(
          { companyId: company._id },
          { createdAt: 1 }
        )
          .sort({ createdAt: -1 })
          .lean()
      ])

      return {
        id: String(company._id),
        name: company.name || "",
        email: company.email || "",
        mobileNumber: company.mobileNumber || "",
        address: company.address || "",
        status: company.status || "active",
        subscription: company.subscription,
        userCount,
        lastActivityDate: (lastLead as any)?.createdAt || null,
        createdAt: company.createdAt,
      }
    })
  )

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  }
}

export async function updateAdminCompany(id: string, body: any) {
  await connectMongoose()
  const companyOid = new Types.ObjectId(id)

  const updateFields: any = {}
  if (body.status) updateFields.status = body.status

  if (body.subscription) {
    if (body.subscription.status) updateFields["subscription.status"] = body.subscription.status
    if (body.subscription.trialEndDate) updateFields["subscription.trialEndDate"] = new Date(body.subscription.trialEndDate)
    if (body.subscription.currentPeriodEnd) updateFields["subscription.currentPeriodEnd"] = new Date(body.subscription.currentPeriodEnd)
  }

  const updated = await Company.findByIdAndUpdate(
    companyOid,
    { $set: updateFields },
    { new: true }
  ).lean()

  return updated
}
