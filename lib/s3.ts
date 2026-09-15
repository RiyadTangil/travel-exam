import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME || process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

/**
 * Extracts the S3 Key from a public URL or returns the key if already formatted.
 * Handles patterns like:
 * - https://bucket.s3.region.amazonaws.com/1234-filename.jpg
 * - https://s3.region.amazonaws.com/bucket/1234-filename.jpg
 * - 1234-filename.jpg
 */
export function extractS3Key(keyOrUrl: string): string {
  if (!keyOrUrl) return ""
  try {
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
      const url = new URL(keyOrUrl)
      const pathname = decodeURIComponent(url.pathname)
      const bucketName = process.env.AWS_BUCKET_NAME || ""

      // If pathname starts with /bucketName/, strip it
      if (bucketName && pathname.startsWith(`/${bucketName}/`)) {
        return pathname.slice(bucketName.length + 2)
      }
      // Otherwise strip leading slash
      return pathname.startsWith("/") ? pathname.slice(1) : pathname
    }
  } catch (err) {
    console.warn("Could not parse S3 URL, treating as raw key:", keyOrUrl)
  }
  return keyOrUrl.startsWith("/") ? keyOrUrl.slice(1) : keyOrUrl
}

/**
 * Deletes an object from S3.
 * Gracefully handles missing bucket or failures without breaking business logic.
 */
export async function deleteS3Object(keyOrUrl: string): Promise<boolean> {
  if (!keyOrUrl) return false

  const bucketName = process.env.AWS_BUCKET_NAME
  if (!bucketName) {
    console.warn("AWS_BUCKET_NAME is not configured. Skipping S3 object deletion.")
    return false
  }

  const key = extractS3Key(keyOrUrl)
  if (!key) return false

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    await s3Client.send(command)
    console.log(`Successfully deleted S3 object: ${key}`)
    return true
  } catch (error: any) {
    console.error(`Error deleting S3 object (${key}):`, error?.message || error)
    return false
  }
}
