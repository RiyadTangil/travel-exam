import connectMongoose from "@/lib/mongoose"
import CrmLead, { ICrmLead } from "@/models/crm-lead"
import { User } from "@/models/user"
import {
  SERVICE_MAP,
  REVERSE_SERVICE_MAP,
  STAGE_MAP,
  REVERSE_STAGE_MAP,
  PRIORITY_MAP,
  REVERSE_PRIORITY_MAP,
  SOURCE_MAP,
  REVERSE_SOURCE_MAP,
  ServiceTypeString,
  StageString,
  PriorityString,
  SourceString,
} from "@/lib/constants/crm"
import { Types } from "mongoose"
import dayjs from "dayjs"

export interface CrmMetricsData {
  totalCount: number
  activeCount: number
  wonCount: number
  totalPipelineValue: number
  wonValue: number
  conversionRate: number
  todayTasksCount: number
}

export interface CrmLeadDTO {
  id: string
  clientName: string
  mobile: string
  email?: string
  serviceType: ServiceTypeString
  destination: string
  paxAdults: number
  paxChildren: number
  estimatedValue: number
  stage: StageString
  priority: PriorityString
  source: SourceString
  assignedTo: string
  assignedToId?: string
  travelDate?: string
  nextFollowUp?: string
  notes?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export function isBossRole(userRole?: string): boolean {
  if (!userRole) return false
  const bossRoles = ["C_ADMIN", "admin", "company", "P_ADMIN", "P_SADMIN"]
  return bossRoles.includes(userRole)
}

// Convert DB Document (numeric enums + populated User relation) to clean API DTO
export function formatLeadDTO(doc: any): CrmLeadDTO {
  let assignedToName = "Unassigned"
  let assignedToId: string | undefined = undefined

  if (doc.assignedTo) {
    if (typeof doc.assignedTo === "object" && doc.assignedTo.name) {
      assignedToName = doc.assignedTo.name
      assignedToId = doc.assignedTo._id.toString()
    } else if (typeof doc.assignedTo === "string") {
      assignedToName = doc.assignedTo
    } else if (doc.assignedTo instanceof Types.ObjectId) {
      assignedToId = doc.assignedTo.toString()
    }
  }

  return {
    id: doc._id.toString(),
    clientName: doc.clientName,
    mobile: doc.mobile,
    email: doc.email || undefined,
    serviceType: REVERSE_SERVICE_MAP[doc.service] || "AIR_TICKET",
    destination: doc.dest,
    paxAdults: doc.paxAdult ?? 1,
    paxChildren: doc.paxChild ?? 0,
    estimatedValue: doc.val,
    stage: REVERSE_STAGE_MAP[doc.stage] || "NEW",
    priority: REVERSE_PRIORITY_MAP[doc.priority] || "MEDIUM",
    source: REVERSE_SOURCE_MAP[doc.source] || "WALK_IN",
    assignedTo: assignedToName,
    assignedToId,
    travelDate: doc.travelDate ? dayjs(doc.travelDate).format("YYYY-MM-DD") : undefined,
    nextFollowUp: doc.nextFollowUp ? dayjs(doc.nextFollowUp).format("YYYY-MM-DD HH:mm") : undefined,
    notes: doc.notes || undefined,
    createdBy: doc.createdBy ? doc.createdBy.toString() : undefined,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : undefined,
    createdAt: doc.createdAt ? dayjs(doc.createdAt).format("YYYY-MM-DD HH:mm") : dayjs().format("YYYY-MM-DD HH:mm"),
    updatedAt: doc.updatedAt ? dayjs(doc.updatedAt).format("YYYY-MM-DD HH:mm") : dayjs().format("YYYY-MM-DD HH:mm"),
  }
}

export async function getSameRoleUserIds(companyId: string, userId: string): Promise<Types.ObjectId[]> {
  const userObjId = new Types.ObjectId(userId)
  const cid = new Types.ObjectId(companyId)

  const loggedUser: any = await User.findById(userObjId).lean()
  if (!loggedUser) return [userObjId]

  const roleFilter: any[] = []
  if (loggedUser.roleId) roleFilter.push({ roleId: loggedUser.roleId })
  if (loggedUser.role) roleFilter.push({ role: loggedUser.role })

  if (roleFilter.length === 0) return [userObjId]

  const matches = await User.find({
    companyId: cid,
    role: { $nin: ["C_ADMIN", "admin", "company"] },
    $or: roleFilter,
  }).select("_id").lean()

  const ids = matches.map((u: any) => u._id as Types.ObjectId)
  if (!ids.some((id) => id.equals(userObjId))) {
    ids.push(userObjId)
  }
  return ids
}

// List Leads with pagination, search, and role-based visibility
export async function listCrmLeads({
  companyId,
  userId,
  userRole,
  page = 1,
  limit = 50,
  search = "",
  stage,
  priority,
  service,
  assignedTo,
}: {
  companyId: string
  userId?: string
  userRole?: string
  page?: number
  limit?: number
  search?: string
  stage?: string
  priority?: string
  service?: string
  assignedTo?: string
}) {
  await connectMongoose()

  const query: any = { companyId: new Types.ObjectId(companyId) }

  // Apply role-based visibility filter if NOT boss/admin
  if (!isBossRole(userRole) && userId && Types.ObjectId.isValid(userId)) {
    const sameRoleUserIds = await getSameRoleUserIds(companyId, userId)
    query.$and = [
      {
        $or: [
          { assignedTo: { $in: sameRoleUserIds } },
          { createdBy: { $in: sameRoleUserIds } },
        ],
      },
    ]
  }

  if (search && search.trim()) {
    const s = search.trim()
    const searchFilter = {
      $or: [
        { clientName: { $regex: s, $options: "i" } },
        { mobile: { $regex: s, $options: "i" } },
        { dest: { $regex: s, $options: "i" } },
      ],
    }
    if (query.$and) {
      query.$and.push(searchFilter)
    } else {
      query.$or = searchFilter.$or
    }
  }

  if (stage && STAGE_MAP[stage as StageString]) {
    query.stage = STAGE_MAP[stage as StageString]
  }

  if (service && SERVICE_MAP[service as ServiceTypeString]) {
    query.service = SERVICE_MAP[service as ServiceTypeString]
  }

  if (priority && PRIORITY_MAP[priority as PriorityString]) {
    query.priority = PRIORITY_MAP[priority as PriorityString]
  }

  if (assignedTo && Types.ObjectId.isValid(assignedTo)) {
    query.assignedTo = new Types.ObjectId(assignedTo)
  }

  const skip = (page - 1) * limit

  const [docs, total] = await Promise.all([
    CrmLead.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CrmLead.countDocuments(query),
  ])

  return {
    data: docs.map(formatLeadDTO),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Create Lead
export async function createCrmLead(payload: any, companyId: string, userId?: string) {
  await connectMongoose()

  const serviceNum = SERVICE_MAP[payload.serviceType as ServiceTypeString] || 1
  const stageNum = STAGE_MAP[payload.stage as StageString] || 1
  const priorityNum = PRIORITY_MAP[payload.priority as PriorityString] || 2
  const sourceNum = SOURCE_MAP[payload.source as SourceString] || 1

  const docPayload: any = {
    companyId: new Types.ObjectId(companyId),
    clientName: payload.clientName,
    mobile: payload.mobile,
    service: serviceNum,
    dest: payload.destination,
    val: payload.estimatedValue,
    stage: stageNum,
    priority: priorityNum,
    source: sourceNum,
  }

  // Handle User ObjectId or string for assignedTo
  if (payload.assignedTo && Types.ObjectId.isValid(payload.assignedTo)) {
    docPayload.assignedTo = new Types.ObjectId(payload.assignedTo)
  } else if (payload.assignedTo) {
    const usr: any = await User.findOne({
      companyId: new Types.ObjectId(companyId),
      name: payload.assignedTo,
    }).lean()
    if (usr) {
      docPayload.assignedTo = usr._id
    }
  }

  if (payload.email) docPayload.email = payload.email
  if (payload.paxAdults !== undefined) docPayload.paxAdult = payload.paxAdults
  if (payload.paxChildren !== undefined) docPayload.paxChild = payload.paxChildren
  if (payload.travelDate) docPayload.travelDate = new Date(payload.travelDate)
  if (payload.nextFollowUp) docPayload.nextFollowUp = new Date(payload.nextFollowUp)
  if (payload.notes) docPayload.notes = payload.notes

  if (userId && Types.ObjectId.isValid(userId)) {
    docPayload.createdBy = new Types.ObjectId(userId)
    docPayload.updatedBy = new Types.ObjectId(userId)
  }

  const leadDoc = await CrmLead.create(docPayload)
  const populated = await CrmLead.findById(leadDoc._id).populate("assignedTo", "name email role").lean()

  return formatLeadDTO(populated || leadDoc)
}

// Get Lead By ID
export async function getCrmLeadById(id: string, companyId: string) {
  await connectMongoose()
  const doc = await CrmLead.findOne({
    _id: new Types.ObjectId(id),
    companyId: new Types.ObjectId(companyId),
  })
    .populate("assignedTo", "name email role")
    .lean()

  if (!doc) return null
  return formatLeadDTO(doc)
}

// Update Lead
export async function updateCrmLead(id: string, payload: any, companyId: string, userId?: string) {
  await connectMongoose()

  const updateFields: any = {}

  if (payload.clientName) updateFields.clientName = payload.clientName
  if (payload.mobile) updateFields.mobile = payload.mobile
  if (payload.email !== undefined) updateFields.email = payload.email
  if (payload.destination) updateFields.dest = payload.destination
  if (payload.estimatedValue !== undefined) updateFields.val = payload.estimatedValue
  if (payload.paxAdults !== undefined) updateFields.paxAdult = payload.paxAdults
  if (payload.paxChildren !== undefined) updateFields.paxChild = payload.paxChildren
  if (payload.notes !== undefined) updateFields.notes = payload.notes

  if (payload.assignedTo && Types.ObjectId.isValid(payload.assignedTo)) {
    updateFields.assignedTo = new Types.ObjectId(payload.assignedTo)
  } else if (payload.assignedTo) {
    const usr: any = await User.findOne({
      companyId: new Types.ObjectId(companyId),
      name: payload.assignedTo,
    }).lean()
    if (usr) {
      updateFields.assignedTo = usr._id
    }
  }

  if (payload.serviceType && SERVICE_MAP[payload.serviceType as ServiceTypeString]) {
    updateFields.service = SERVICE_MAP[payload.serviceType as ServiceTypeString]
  }
  if (payload.stage && STAGE_MAP[payload.stage as StageString]) {
    updateFields.stage = STAGE_MAP[payload.stage as StageString]
  }
  if (payload.priority && PRIORITY_MAP[payload.priority as PriorityString]) {
    updateFields.priority = PRIORITY_MAP[payload.priority as PriorityString]
  }
  if (payload.source && SOURCE_MAP[payload.source as SourceString]) {
    updateFields.source = SOURCE_MAP[payload.source as SourceString]
  }

  if (payload.travelDate) updateFields.travelDate = new Date(payload.travelDate)
  if (payload.nextFollowUp) updateFields.nextFollowUp = new Date(payload.nextFollowUp)

  if (userId && Types.ObjectId.isValid(userId)) {
    updateFields.updatedBy = new Types.ObjectId(userId)
  }

  const updatedDoc = await CrmLead.findOneAndUpdate(
    { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("assignedTo", "name email role")
    .lean()

  if (!updatedDoc) return null
  return formatLeadDTO(updatedDoc)
}

// Delete Lead
export async function deleteCrmLead(id: string, companyId: string) {
  await connectMongoose()
  const result = await CrmLead.deleteOne({
    _id: new Types.ObjectId(id),
    companyId: new Types.ObjectId(companyId),
  })
  return result.deletedCount > 0
}

// Calculate Metrics
export async function getCrmMetrics(companyId: string, userId?: string, userRole?: string) {
  await connectMongoose()
  const cid = new Types.ObjectId(companyId)

  const leadQuery: any = { companyId: cid }

  if (!isBossRole(userRole) && userId && Types.ObjectId.isValid(userId)) {
    const sameRoleUserIds = await getSameRoleUserIds(companyId, userId)
    leadQuery.$or = [
      { assignedTo: { $in: sameRoleUserIds } },
      { createdBy: { $in: sameRoleUserIds } },
    ]
  }

  const todayStart = dayjs().startOf("day").toDate()
  const todayEnd = dayjs().endOf("day").toDate()

  const [allLeads, todayTasksCount] = await Promise.all([
    CrmLead.find(leadQuery).lean(),
    CrmLead.countDocuments({
      ...leadQuery,
      nextFollowUp: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),
  ])

  const totalCount = allLeads.length
  const wonLeads = allLeads.filter((l) => l.stage === STAGE_MAP["WON"])
  const activeLeads = allLeads.filter(
    (l) => l.stage !== STAGE_MAP["WON"] && l.stage !== STAGE_MAP["LOST"]
  )

  const totalPipelineValue = activeLeads.reduce((acc, l) => acc + (l.val || 0), 0)
  const wonValue = wonLeads.reduce((acc, l) => acc + (l.val || 0), 0)
  const conversionRate = totalCount > 0 ? Math.round((wonLeads.length / totalCount) * 100) : 0

  return {
    totalCount,
    activeCount: activeLeads.length,
    wonCount: wonLeads.length,
    totalPipelineValue,
    wonValue,
    conversionRate,
    todayTasksCount,
  }
}

