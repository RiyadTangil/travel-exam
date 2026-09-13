import { type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ok, fail } from "@/utils/api-response";
import { connectMongoose } from "@/lib/mongoose";
import CompanyCommunication from "@/models/CompanyCommunication";
import MarketingCampaign from "@/models/MarketingCampaign"; // Required for populate
import { Types } from "mongoose";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "ri11559988";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return fail("Invalid company ID", 400);
    }

    await connectMongoose();

    const history = await CompanyCommunication.find({ company_id: new Types.ObjectId(id) })
      .populate('campaign_id')
      .sort({ createdAt: -1 })
      .lean();

    return ok({ history });

  } catch (error: any) {
    console.error("Failed to fetch history:", error);
    return fail(error.message || "Failed to fetch history", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return fail("Invalid company ID", 400);
    }

    const body = await req.json();
    const { note, status } = body;

    if (!note) {
      return fail("Note text is required", 400);
    }

    await connectMongoose();

    const communication = new CompanyCommunication({
      company_id: new Types.ObjectId(id),
      type: 'manual_note',
      note,
      status: status || undefined,
    });

    await communication.save();

    return ok(communication, 200, "Note added successfully");

  } catch (error: any) {
    console.error("Failed to add note:", error);
    return fail(error.message || "Failed to add note", 500);
  }
}
