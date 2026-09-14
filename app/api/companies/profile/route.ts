import { MONGODB_DB_NAME } from "@/lib/database-config"
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Company } from "@/models/company";

// Hardcode the secret as a temporary workaround
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key";

// GET - Fetch the profile of the currently logged in company
export async function GET(request: NextRequest) {
  try {
    // Get token from the request
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    // Check if user is authenticated and has permission
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role === "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden. Candidates cannot view company profile" }, { status: 403 });
    }

    const permissions = (token.permissions as string[]) || [];
    const isCompany = token.role === "company";
    const hasAllPerms = permissions.includes("perm-all");
    const hasViewPerm = permissions.some(p => p.startsWith("perm-/dashboard/profile") && p.includes("view"));

    // Allow viewing profile if user is a company, has explicit view permission, OR is an authenticated user fetching their own company profile for utility purposes
    if (!isCompany && !hasAllPerms && !hasViewPerm && !token.companyId) {
      return NextResponse.json({ error: "Forbidden. You do not have permission to view company profile" }, { status: 403 });
    }

    // Get company ID from token
    const companyId = token.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found in token" }, { status: 400 });
    }


    // Find company by ID and convert to plain object
    const company: any = await Company.findOne({ _id: new ObjectId(companyId.toString()) }).lean();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }


    const companyWithStats = {
      ...company,
      _id: company._id.toString(),
      clientsCount: {
        b2b: 0,
        b2c: 0,
        total: 0
      }
    };

    return NextResponse.json({ company: companyWithStats });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update company profile
export async function PATCH(request: NextRequest) {
  try {
    // Get token from the request
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    // Check if user is authenticated and has permission
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role === "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden. Candidates cannot update company profile" }, { status: 403 });
    }

    const permissions = (token.permissions as string[]) || [];
    const isCompany = token.role === "company";
    const isSuperAdmin = token.role === "C_ADMIN";
    
    // Only C_ADMIN can update company profile
    const hasAllPerms = permissions.includes("perm-all");
    const hasEditPerm = permissions.some(p => p.startsWith("perm-/dashboard/profile") && p.includes("edit"));

    if (!isCompany && !isSuperAdmin && !hasAllPerms && !hasEditPerm) {
      return NextResponse.json({ error: "Forbidden. You do not have permission to update company profile" }, { status: 403 });
    }

    // Get company ID from token
    const companyId = token.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found in token" }, { status: 400 });
    }

    // Get update data from request
    const data = await request.json();

    // Fields that can be updated by the company
    const allowedFields = [
      'name', 
      'email', 
      'mobileNumber', 
      'address', 
      'logoUrl'
    ];
    
    // Filter to only allowed fields
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();



    // Update company
    const result = await Company.updateOne(
      { _id: new ObjectId(companyId.toString()) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Company profile updated successfully",
      updated: updateData
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 