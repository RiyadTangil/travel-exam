import { NextRequest } from "next/server"
import { ok, badRequest, fail } from "@/utils/api-response"
import { getToken } from "next-auth/jwt"
import { sendCampaignEmail } from "@/lib/email"
import { connectMongoose } from "@/lib/mongoose"
import MarketingCampaign from "@/models/MarketingCampaign"
import CompanyCommunication from "@/models/CompanyCommunication"
import { Types } from "mongoose"

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "ri11559988";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
    
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401)
    }

    const body = await request.json()
    const { recipients, subject, html, companyIds, attachments } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return badRequest("Recipients array is required")
    }

    if (!subject) {
      return badRequest("Subject is required")
    }

    if (!html) {
      return badRequest("HTML body is required")
    }

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
        return badRequest("Company IDs array is required to log communication")
    }

    await connectMongoose()

    let successCount = 0
    let failureCount = 0

    // Send emails
    for (const email of recipients) {
      try {
        await sendCampaignEmail(email, subject, html, attachments)
        successCount++
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error)
        failureCount++
      }
    }

    // Log the campaign and communications if at least one email was sent
    if (successCount > 0 || failureCount > 0) {
        // 1. De-duplicate: Check if an identical campaign already exists
        let campaign = await MarketingCampaign.findOne({
            type: 'email',
            subject,
            body: html
        });

        if (!campaign) {
            campaign = new MarketingCampaign({
                type: 'email',
                subject,
                body: html
            });
            await campaign.save();
        }

        // Log communication for each company
        for (const companyId of companyIds) {
            if (Types.ObjectId.isValid(companyId)) {
                const communication = new CompanyCommunication({
                    company_id: new Types.ObjectId(companyId),
                    type: 'campaign',
                    campaign_id: campaign._id,
                    status: 'sent'
                })
                await communication.save()
            }
        }
    }

    return ok({ successCount, failureCount }, 200, `Successfully sent ${successCount} emails.`)
  } catch (error: any) {
    console.error("admin.companies.send-email error:", error)
    return fail("Internal server error", 500)
  }
}
