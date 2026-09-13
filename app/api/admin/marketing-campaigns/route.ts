import { type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ok, fail } from "@/utils/api-response";
import { connectMongoose } from "@/lib/mongoose";
import MarketingCampaign from "@/models/MarketingCampaign";
import AgencyCommunication from "@/models/AgencyCommunication";
import GovtRegAgency from "@/models/govt-reg-agency";


const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "ri11559988";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    
    await connectMongoose();

    const campaigns = await MarketingCampaign.find()
      .sort({ createdAt: -1 })
      .lean();

    return ok(campaigns);
  } catch (error: any) {
    console.error("Failed to fetch marketing campaigns:", error);
    return fail(error.message || "Failed to fetch campaigns", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    
    await connectMongoose();
    
    const body = await req.json();
    const { type, subject, messageBody, agencyIds } = body;

    if (!type || !messageBody || !Array.isArray(agencyIds) || agencyIds.length === 0) {
      return fail("Missing required fields or agency IDs", 400);
    }




    // 1. De-duplicate: Check if an identical campaign already exists
    let campaign = await MarketingCampaign.findOne({
      type,
      subject: subject || undefined,
      body: messageBody,
    });

    if (!campaign) {
      campaign = new MarketingCampaign({
        type,
        subject: subject || undefined,
        body: messageBody,
      });
      await campaign.save();
    }

    // Find all unique agency IDs that already have a status using an optimized distinct query
    const agenciesWithStatus = new Set(
      await AgencyCommunication.distinct("agency_id", {
        agency_id: { $in: agencyIds },
        status: { $exists: true, $nin: [null, ""] }
      })
    );

    // 2. Prepare bulk insert for all AgencyCommunications
    const bulkOps = agencyIds.map((agencyId: number) => {
      const hasExistingStatus = agenciesWithStatus.has(agencyId);
      return {
        insertOne: {
          document: {
            agency_id: agencyId,
            type: "campaign",
            campaign_id: campaign._id,
            status: hasExistingStatus ? undefined : "sent",
          },
        },
      };
    });

    // 3. Execute bulk write
    if (bulkOps.length > 0) {
      await AgencyCommunication.bulkWrite(bulkOps);
    }

    return ok(
      { campaignId: campaign._id }, 
      200, 
      `Campaign logged for ${agencyIds.length} agencies`
    );

  } catch (error: any) {
    console.error("Failed to log marketing campaign:", error);
    return fail(error.message || "Failed to log campaign", 500);
  }
}
