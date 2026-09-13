import { NextRequest, NextResponse } from "next/server"
import { getServerSession, Session } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getTemplateConfig, upsertTemplateConfig } from "@/services/invoiceTemplateConfigService"
import { ok, fail, badRequest } from "@/utils/api-response"

/**
 * GET /api/invoice-template-config
 * Returns the calling company's invoice template configuration.
 * Falls back to system defaults if not yet configured.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as Session | null
    const companyId = session?.user?.companyId
    if (!companyId) return fail("Unauthorized", 401)

    const config = await getTemplateConfig(String(companyId))
    // Return config or system defaults
    return ok(
      config ?? {
        defaultTemplateId: "airline",
        overrides: [],
        showWatermark: true,
        showSignatures: true,
        showServiceCharge: true,
        showVat: true,
        showPayment: true,
        showDue: true,
        showFlightDetails: 0,
        signatureUrl: null,
        signatureTitle: "Authority Signature",
        customHeader: null,
        customFooter: null,
      }
    )
  } catch (error: any) {
    console.error("GET invoice-template-config error:", error)
    return fail(error.message || "Internal Server Error", 500)
  }
}

/**
 * PUT /api/invoice-template-config
 * Create or update the company's invoice template configuration.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as Session | null
    const companyId = session?.user?.companyId
    const userId = (session?.user as any)?.id || (session?.user as any)?.userId
    if (!companyId || !userId) return fail("Unauthorized", 401)

    const body = await req.json()

    const {
      defaultTemplateId,
      overrides,
      showWatermark,
      showSignatures,
      showServiceCharge,
      showVat,
      showPayment,
      showDue,
      showFlightDetails,
      signatureUrl,
      signatureTitle,
      customHeader,
      customFooter,
    } = body

    if (!defaultTemplateId) return badRequest("defaultTemplateId is required")

    const config = await upsertTemplateConfig(String(companyId), String(userId), {
      defaultTemplateId,
      overrides,
      showWatermark,
      showSignatures,
      showServiceCharge,
      showVat,
      showPayment,
      showDue,
      showFlightDetails: showFlightDetails !== undefined ? (Number(showFlightDetails) ? 1 : 0) : undefined,
      signatureUrl,
      signatureTitle,
      customHeader,
      customFooter,
    })

    return ok(config, 200, "Template config saved successfully")
  } catch (error: any) {
    console.error("PUT invoice-template-config error:", error)
    return fail(error.message || "Internal Server Error", 500)
  }
}
