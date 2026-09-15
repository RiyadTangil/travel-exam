import mongoose from "mongoose"
import { GridFSBucket, ObjectId } from "mongodb"
import connectMongoose from "@/lib/mongoose"

const BUCKET_NAME = "media_uploads"

/**
 * Returns a MongoDB GridFSBucket instance using the active Mongoose connection.
 */
export async function getGridFSBucket(): Promise<GridFSBucket> {
  await connectMongoose()
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not established")
  }
  return new GridFSBucket(mongoose.connection.db as any, { bucketName: BUCKET_NAME })
}

/**
 * Uploads a file buffer directly to MongoDB GridFS.
 */
export async function uploadBufferToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string = "image/jpeg"
): Promise<{ fileId: string; publicUrl: string; filename: string }> {
  const bucket = await getGridFSBucket()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  const uniqueName = `${Date.now()}-${cleanFilename}`

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(uniqueName, {
      contentType,
      metadata: {
        originalName: filename,
        uploadedAt: new Date(),
      },
    })

    uploadStream.on("error", (err) => {
      console.error("[GridFS] Upload error:", err)
      reject(err)
    })

    uploadStream.on("finish", () => {
      const fileId = uploadStream.id.toString()
      resolve({
        fileId,
        publicUrl: `/api/media/${fileId}`,
        filename: uniqueName,
      })
    })

    uploadStream.end(buffer)
  })
}

/**
 * Deletes a file and all its chunks from MongoDB GridFS.
 * Accepts a raw ObjectId hex string or an API URL like /api/media/[id].
 */
export async function deleteFileFromGridFS(fileIdOrUrl: string): Promise<boolean> {
  if (!fileIdOrUrl) return false

  try {
    const bucket = await getGridFSBucket()
    let idStr = fileIdOrUrl.trim()

    // If a full path or URL is provided, extract the last segment
    if (idStr.includes("/")) {
      const parts = idStr.split("/").filter(Boolean)
      idStr = parts[parts.length - 1]
    }

    if (!ObjectId.isValid(idStr)) {
      return false
    }

    const oid = new ObjectId(idStr)
    // Check if the file exists in the bucket
    const files = await bucket.find({ _id: oid }).toArray()
    if (!files || files.length === 0) {
      console.warn(`[GridFS] File ${idStr} not found in bucket ${BUCKET_NAME}`)
      return false
    }

    await bucket.delete(oid)
    console.log(`[GridFS] Successfully deleted file ${idStr} from MongoDB`)
    return true
  } catch (err: any) {
    console.error("[GridFS] Error deleting file:", err?.message || err)
    return false
  }
}
