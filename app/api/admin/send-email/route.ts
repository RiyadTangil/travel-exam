import { NextRequest } from "next/server"
import { ok, badRequest, fail } from "@/utils/api-response"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendCampaignEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    // In a real application, you might want to verify the user has admin permissions here
    if (!(session as any)?.user?.id) {
      return fail("Unauthorized", 401)
    }

    const body = await request.json()
    const { recipients, subject, html } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return badRequest("Recipients array is required")
    }

    if (!subject) {
      return badRequest("Subject is required")
    }

    if (!html) {
      return badRequest("HTML body is required")
    }

    let successCount = 0
    let failureCount = 0

    // Send emails sequentially or in parallel batches
    for (const email of recipients) {
      try {
        await sendCampaignEmail(email, subject, html)
        successCount++
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error)
        failureCount++
      }
    }

    return ok({ successCount, failureCount }, 200, `Successfully sent ${successCount} emails.`)
  } catch (error: any) {
    console.error("admin.send-email error:", error)
    return fail("Internal server error", 500)
  }
}
