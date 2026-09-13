import connectMongoose from "@/lib/mongoose"
import { InvoiceTemplateConfig } from "@/models/invoice-template-config"
import { Types } from "mongoose"
import "@/models/register-models"

/**
 * Get the company's invoice template config.
 * Returns null if not yet configured — callers should fall back to system defaults.
 */
export async function getTemplateConfig(companyId: string) {
  await connectMongoose()
  if (!companyId || !Types.ObjectId.isValid(companyId)) return null

  const config = await InvoiceTemplateConfig.findOne({
    companyId: new Types.ObjectId(companyId),
  }).lean()

  if (!config) return null

  return {
    _id: String(config._id),
    companyId: String(config.companyId),
    defaultTemplateId: config.defaultTemplateId ?? "airline",
    overrides: config.overrides ?? [],
    showWatermark: config.showWatermark ?? true,
    showSignatures: config.showSignatures ?? true,
    showServiceCharge: config.showServiceCharge ?? true,
    showVat: config.showVat ?? true,
    showPayment: config.showPayment ?? true,
    showDue: config.showDue ?? true,
    showFlightDetails: config.showFlightDetails ?? 0,
    signatureUrl: config.signatureUrl ?? null,
    signatureTitle: config.signatureTitle ?? "Authority Signature",
    customHeader: config.customHeader ?? null,
    customFooter: config.customFooter ?? null,
  }
}

/**
 * Upsert the company's invoice template config.
 */
export async function upsertTemplateConfig(
  companyId: string,
  userId: string,
  payload: {
    defaultTemplateId?: string
    overrides?: Array<{ invoiceType: string; templateId: string }>
    showWatermark?: boolean
    showSignatures?: boolean
    showServiceCharge?: boolean
    showVat?: boolean
    showPayment?: boolean
    showDue?: boolean
    showFlightDetails?: number
    signatureUrl?: string | null
    signatureTitle?: string | null
    customHeader?: string | null
    customFooter?: string | null
  }
) {
  await connectMongoose()
  if (!companyId || !Types.ObjectId.isValid(companyId)) {
    throw new Error("Invalid company ID")
  }

  const companyIdObj = new Types.ObjectId(companyId)
  const userIdObj = new Types.ObjectId(userId)

  const updateDoc: any = {
    updatedBy: userIdObj,
  }

  if (payload.defaultTemplateId !== undefined) updateDoc.defaultTemplateId = payload.defaultTemplateId
  if (payload.overrides !== undefined) updateDoc.overrides = payload.overrides
  if (payload.showWatermark !== undefined) updateDoc.showWatermark = payload.showWatermark
  if (payload.showSignatures !== undefined) updateDoc.showSignatures = payload.showSignatures
  if (payload.showServiceCharge !== undefined) updateDoc.showServiceCharge = payload.showServiceCharge
  if (payload.showVat !== undefined) updateDoc.showVat = payload.showVat
  if (payload.showPayment !== undefined) updateDoc.showPayment = payload.showPayment
  if (payload.showDue !== undefined) updateDoc.showDue = payload.showDue
  if (payload.showFlightDetails !== undefined) updateDoc.showFlightDetails = payload.showFlightDetails ? 1 : 0

  // Explicitly allow clearing optional fields by saving null / trimmed string
  if ("signatureUrl" in payload) {
    updateDoc.signatureUrl = payload.signatureUrl && payload.signatureUrl.trim() ? payload.signatureUrl.trim() : null
  }
  if ("signatureTitle" in payload) {
    updateDoc.signatureTitle = payload.signatureTitle && payload.signatureTitle.trim() ? payload.signatureTitle.trim() : "Authority Signature"
  }
  if ("customHeader" in payload) {
    updateDoc.customHeader = payload.customHeader && payload.customHeader.trim() ? payload.customHeader.trim() : null
  }
  if ("customFooter" in payload) {
    updateDoc.customFooter = payload.customFooter && payload.customFooter.trim() ? payload.customFooter.trim() : null
  }

  const updated = await InvoiceTemplateConfig.findOneAndUpdate(
    { companyId: companyIdObj },
    {
      $set: updateDoc,
      $setOnInsert: {
        companyId: companyIdObj,
        createdBy: userIdObj,
      },
    },
    { upsert: true, new: true, lean: true }
  )

  if (!updated) {
    throw new Error("Failed to update invoice template config")
  }

  return {
    _id: String(updated._id),
    companyId: String(updated.companyId),
    defaultTemplateId: updated.defaultTemplateId ?? "airline",
    overrides: updated.overrides ?? [],
    showWatermark: updated.showWatermark ?? true,
    showSignatures: updated.showSignatures ?? true,
    showServiceCharge: updated.showServiceCharge ?? true,
    showVat: updated.showVat ?? true,
    showPayment: updated.showPayment ?? true,
    showDue: updated.showDue ?? true,
    showFlightDetails: updated.showFlightDetails ?? 0,
    signatureUrl: updated.signatureUrl ?? null,
    signatureTitle: updated.signatureTitle ?? "Authority Signature",
    customHeader: updated.customHeader ?? null,
    customFooter: updated.customFooter ?? null,
  }
}
