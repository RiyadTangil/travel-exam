import { type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ok, fail } from "@/utils/api-response";
import { connectMongoose } from "@/lib/mongoose";
import GovtRegAgency from "@/models/govt-reg-agency";
import AgencyCommunication from "@/models/AgencyCommunication";


const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "ri11559988";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    if (!token) {
      return fail("Unauthorized", 401);
    }

    if (token.userType !== "PLATFORM") {
      return fail("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const isNew = searchParams.get("isNew") || "";
    const hasFb = searchParams.get("hasFb") || "";
    const isTrabill = searchParams.get("isTrabill") || "";
    const campaignId = searchParams.get("campaignId") || "";
    const campaignFilterType = searchParams.get("campaignFilterType") || "sent";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    await connectMongoose();

    const query: any = {};

    if (search) {
      const keywords = search.toLowerCase().split(/\s+/).filter(Boolean);
      // We will create an AND condition so that every keyword matches at least one of the fields
      query.$and = keywords.map(keyword => {
        if (keyword.startsWith("not-") && keyword.length > 4) {
          const val = keyword.slice(4);
          const escapedVal = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return {
            business_address_en: { $not: { $regex: escapedVal, $options: "i" } }
          };
        } else {
          const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return {
            $or: [
              { agency_name_license: { $regex: escapedKeyword, $options: "i" } },
              { website: { $regex: escapedKeyword, $options: "i" } },
              { business_address_en: { $regex: escapedKeyword, $options: "i" } },
              { "emails.address": { $regex: escapedKeyword, $options: "i" } },
              { "phones.number": { $regex: escapedKeyword, $options: "i" } }
            ]
          };
        }
      });
    }

    if (startDate && endDate) {
      query.license_expired_date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.license_expired_date = { $gte: startDate };
    } else if (endDate) {
      query.license_expired_date = { $lte: endDate };
    }

    if (isNew === "1") {
      query.is_new = 1;
    }

    if (hasFb === "1") {
      query.facebook_page = { $exists: true, $ne: "", $regex: /.*/ };
    }

    if (isTrabill === "1") {
      query.trabillExp = { $exists: true, $ne: null };
    }

    if (campaignId) {
      const communications = await AgencyCommunication.find({
        campaign_id: campaignId,
        type: 'campaign'
      }).select('agency_id').lean();
      
      const targetAgencyIds = communications.map(c => c.agency_id);
      
      if (campaignFilterType === "not_sent") {
        query.id = { $nin: targetAgencyIds };
      } else {
        query.id = { $in: targetAgencyIds };
      }
    }

    const pipeline: any[] = [];
    
    // Match GovtRegAgency filters first
    pipeline.push({ $match: query });

    // Lookup latest communication with status
    const commsCollectionName = AgencyCommunication.collection.name;
    pipeline.push({
      $lookup: {
        from: commsCollectionName,
        let: { agencyId: "$id" },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ["$agency_id", "$$agencyId"] }, { $ne: ["$status", null] } ] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 }
        ],
        as: "latestComm"
      }
    });

    pipeline.push({
      $unwind: {
        path: "$latestComm",
        preserveNullAndEmptyArrays: true
      }
    });

    // Filter by status if selected
    if (status) {
      if (status === "none") {
        pipeline.push({
          $match: { "latestComm.status": { $exists: false } }
        });
      } else {
        pipeline.push({
          $match: { "latestComm.status": status }
        });
      }
    }

    // Sort by latest communication status date if status filter is selected
    if (status && status !== "none") {
      pipeline.push({
        $sort: { "latestComm.createdAt": -1 }
      });
    }

    // Facet pagination to retrieve both total count and paginated items in a single query
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    });

    const result = await GovtRegAgency.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total || 0;
    const items = result[0]?.data || [];

    const itemsWithStatus = items.map((item: any) => ({
      ...item,
      status: item.latestComm?.status || undefined,
      statusDate: item.latestComm?.createdAt || undefined,
      statusNote: item.latestComm?.note || undefined
    }));

    return ok({
      items: itemsWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching registered agencies:", error);
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    if (!token) {
      return fail("Unauthorized", 401);
    }

    if (token.userType !== "PLATFORM") {
      return fail("Forbidden", 403);
    }

    const body = await request.json();
    const { id, facebook_page } = body;

    if (!id) {
      return fail("Agency ID is required", 400);
    }

    const { searchParams } = new URL(request.url);

    await connectMongoose();

    const updatedItem = await GovtRegAgency.findOneAndUpdate(
      { id },
      { $set: { facebook_page } },
      { new: true, lean: true }
    );

    if (!updatedItem) {
      return fail("Agency not found", 404);
    }

    return ok({ message: "Agency updated successfully", data: updatedItem });
  } catch (error: any) {
    console.error("Failed to update agency:", error);
    return fail(error.message || "Failed to update agency", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || token.userType !== "PLATFORM") {
      return fail("Unauthorized", 401);
    }

    const body = await req.json();
    const { name, license, email, phone, website, address, expiry } = body;

    if (!name) {
      return fail("Agency name is required", 400);
    }

    const { searchParams } = new URL(req.url);

    await connectMongoose();

    const agency_name_license = license ? `${name}\n${license}` : name;
    
    // Generate unique ID (epoch time in seconds)
    const id = Math.floor(Date.now() / 1000);

    const emails = email ? [{ address: email, isDefault: 1 }] : [];
    const phones = phone ? [{ number: phone, isDefault: 1 }] : [];

    const newAgency = new GovtRegAgency({
      id,
      agency_name_license,
      website: website || undefined,
      emails,
      phones,
      business_address_en: address || undefined,
      license_expired_date: expiry || undefined,
      is_new: 1, // Mark manually added
      is_approved: 1, // Assuming approved if added by admin
    });

    await newAgency.save();

    return ok(newAgency, 200, "Agency created successfully");
  } catch (error: any) {
    console.error("Failed to create agency:", error);
    return fail(error.message || "Failed to create agency", 500);
  }
}
