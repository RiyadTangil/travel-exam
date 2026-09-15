import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ok, fail, badRequest } from "@/utils/api-response";
import { uploadBufferToGridFS, deleteFileFromGridFS } from "@/lib/gridfs";
import { s3Client, deleteS3Object } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Direct upload to MongoDB GridFS via multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return badRequest("No file provided in form-data");
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";

      const { fileId, publicUrl, filename } = await uploadBufferToGridFS(
        buffer,
        file.name || "image.jpg",
        mimeType
      );

      return ok(
        {
          fileId,
          fileKey: fileId,
          publicUrl,
          fileName: filename,
        },
        200,
        "Image uploaded to MongoDB successfully"
      );
    }

    // 2. Fallback: Presigned URL for AWS S3 if requested via JSON
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return badRequest("fileName and fileType are required");
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
      return fail("AWS_BUCKET_NAME is not configured");
    }

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const region = process.env.AWS_REGION_NAME || process.env.AWS_REGION || "ap-south-1";
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;

    return ok(
      {
        presignedUrl,
        publicUrl,
        fileName: uniqueFileName,
        fileKey: uniqueFileName,
      },
      200,
      "Upload URL generated successfully"
    );
  } catch (error: any) {
    console.error("Error handling upload:", error);
    return fail(error.message || "Failed to process upload", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyParam = searchParams.get("key") || searchParams.get("url") || searchParams.get("id");

    let target = keyParam;
    if (!target) {
      try {
        const body = await req.json();
        target = body?.key || body?.url || body?.id || body?.fileId;
      } catch {
        // No json body
      }
    }

    if (!target) {
      return badRequest("File key, url, or ID is required for deletion");
    }

    // Try deleting from MongoDB GridFS first
    const gridFsDeleted = await deleteFileFromGridFS(target);
    if (gridFsDeleted) {
      return ok({ deleted: true, storage: "mongodb" }, 200, "File deleted from MongoDB successfully");
    }

    // If not in GridFS and looks like S3 URL/key, try S3
    const s3Deleted = await deleteS3Object(target);
    if (s3Deleted) {
      return ok({ deleted: true, storage: "s3" }, 200, "File deleted from S3 successfully");
    }

    return ok({ deleted: true }, 200, "File deletion processed");
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return fail(error.message || "Failed to delete file", 500);
  }
}
