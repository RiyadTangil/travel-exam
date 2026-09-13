import connectMongoose from "@/lib/mongoose"
import CrmTask from "@/models/crm-task"
import { User } from "@/models/user"
import { isBossRole, getSameRoleUserIds } from "@/services/crmService"
import {
  TASK_CATEGORY_MAP,
  REVERSE_TASK_CATEGORY_MAP,
  PRIORITY_MAP,
  REVERSE_PRIORITY_MAP,
  TaskCategoryString,
  PriorityString,
  CrmTaskCategoryEnum,
  CrmPriorityEnum,
} from "@/lib/constants/crm"
import { Types } from "mongoose"
import dayjs from "dayjs"

export interface CrmTaskDTO {
  id: string
  leadId?: string
  clientName: string
  mobile: string
  title: string
  dueDate: string
  assignedTo: string
  assignedToId?: string
  category: TaskCategoryString
  priority: PriorityString
  completed: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export function formatTaskDTO(doc: any): CrmTaskDTO {
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

  const catStr = typeof doc.category === "number"
    ? (REVERSE_TASK_CATEGORY_MAP[doc.category] || "GENERAL_CALL")
    : (doc.category || "GENERAL_CALL")

  const prioStr = typeof doc.priority === "number"
    ? (REVERSE_PRIORITY_MAP[doc.priority] || "HIGH")
    : (doc.priority || "HIGH")

  return {
    id: doc._id.toString(),
    leadId: doc.leadId ? doc.leadId.toString() : undefined,
    clientName: doc.clientName || "",
    mobile: doc.mobile || "",
    title: doc.title || "",
    dueDate: doc.dueDate ? dayjs(doc.dueDate).format("YYYY-MM-DD HH:mm") : dayjs().format("YYYY-MM-DD HH:mm"),
    assignedTo: assignedToName,
    assignedToId,
    category: catStr,
    priority: prioStr,
    completed: !!doc.completed,
    createdBy: doc.createdBy ? doc.createdBy.toString() : undefined,
    createdAt: doc.createdAt ? dayjs(doc.createdAt).format("YYYY-MM-DD HH:mm") : dayjs().format("YYYY-MM-DD HH:mm"),
    updatedAt: doc.updatedAt ? dayjs(doc.updatedAt).format("YYYY-MM-DD HH:mm") : dayjs().format("YYYY-MM-DD HH:mm"),
  }
}

export async function listCrmTasks({
  companyId,
  userId,
  userRole,
  assignedTo,
}: {
  companyId: string
  userId?: string
  userRole?: string
  assignedTo?: string
}) {
  await connectMongoose()
  const cid = new Types.ObjectId(companyId)

  const query: any = { companyId: cid }

  if (!isBossRole(userRole) && userId && Types.ObjectId.isValid(userId)) {
    const sameRoleUserIds = await getSameRoleUserIds(companyId, userId)
    query.$or = [
      { assignedTo: { $in: sameRoleUserIds } },
      { createdBy: { $in: sameRoleUserIds } },
    ]
  }

  if (assignedTo && Types.ObjectId.isValid(assignedTo)) {
    query.assignedTo = new Types.ObjectId(assignedTo)
  }

  const docs = await CrmTask.find(query)
    .populate("assignedTo", "name email role")
    .sort({ dueDate: 1 })
    .lean()

  return docs.map(formatTaskDTO)
}

export async function createCrmTask(payload: any, companyId: string, userId?: string) {
  await connectMongoose()

  const catNum = TASK_CATEGORY_MAP[payload.category as TaskCategoryString] || CrmTaskCategoryEnum.GENERAL_CALL
  const prioNum = PRIORITY_MAP[payload.priority as PriorityString] || CrmPriorityEnum.HIGH

  const docPayload: any = {
    companyId: new Types.ObjectId(companyId),
    clientName: payload.clientName,
    mobile: payload.mobile || "",
    title: payload.title,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : new Date(),
    category: catNum,
    priority: prioNum,
    completed: !!payload.completed,
  }

  if (payload.leadId && Types.ObjectId.isValid(payload.leadId)) {
    docPayload.leadId = new Types.ObjectId(payload.leadId)
  }

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

  if (userId && Types.ObjectId.isValid(userId)) {
    docPayload.createdBy = new Types.ObjectId(userId)
    docPayload.updatedBy = new Types.ObjectId(userId)
  }

  const taskDoc = await CrmTask.create(docPayload)
  const populated = await CrmTask.findById(taskDoc._id).populate("assignedTo", "name email role").lean()

  return formatTaskDTO(populated || taskDoc)
}

export async function updateCrmTask(id: string, payload: any, companyId: string, userId?: string) {
  await connectMongoose()

  const updateFields: any = {}

  if (payload.clientName !== undefined) updateFields.clientName = payload.clientName
  if (payload.mobile !== undefined) updateFields.mobile = payload.mobile
  if (payload.title !== undefined) updateFields.title = payload.title
  if (payload.dueDate !== undefined) updateFields.dueDate = new Date(payload.dueDate)
  if (payload.category !== undefined) {
    updateFields.category = TASK_CATEGORY_MAP[payload.category as TaskCategoryString] ?? CrmTaskCategoryEnum.GENERAL_CALL
  }
  if (payload.priority !== undefined) {
    updateFields.priority = PRIORITY_MAP[payload.priority as PriorityString] ?? CrmPriorityEnum.HIGH
  }
  if (payload.completed !== undefined) updateFields.completed = !!payload.completed

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

  if (userId && Types.ObjectId.isValid(userId)) {
    updateFields.updatedBy = new Types.ObjectId(userId)
  }

  const updatedDoc = await CrmTask.findOneAndUpdate(
    { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("assignedTo", "name email role")
    .lean()

  if (!updatedDoc) return null
  return formatTaskDTO(updatedDoc)
}

export async function deleteCrmTask(id: string, companyId: string) {
  await connectMongoose()
  const result = await CrmTask.deleteOne({
    _id: new Types.ObjectId(id),
    companyId: new Types.ObjectId(companyId),
  })
  return result.deletedCount > 0
}
