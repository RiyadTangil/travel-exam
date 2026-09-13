import { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import GovtRegAgency from "@/models/govt-reg-agency";
import { ok, fail, badRequest } from "@/utils/api-response";


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const numericId = parseInt(await params.id, 10);
    if (isNaN(numericId)) {
      return badRequest("Invalid agency ID");
    }

    const body = await req.json();
    const { facebook_page, emails, phones, website, trabillExp } = body;

    const { searchParams } = new URL(req.url);

    await connectMongoose();

    const agency = await GovtRegAgency.findOne({ id: numericId });
    if (!agency) {
      return fail("Agency not found", 404);
    }

    if (facebook_page !== undefined) {
      agency.facebook_page = facebook_page;
    }

    if (emails !== undefined) {
      agency.emails = emails;
    }

    if (phones !== undefined) {
      agency.phones = phones;
    }

    if (website !== undefined) {
      agency.website = website;
    }

    if (trabillExp !== undefined) {
      agency.trabillExp = trabillExp ? new Date(trabillExp) : undefined;
    }

    await agency.save();

    return ok(agency, 200, "Agency updated successfully");
  } catch (error: any) {
    console.error("Failed to update agency:", error);
    return fail(error.message || "Failed to update agency", 500);
  }
}
