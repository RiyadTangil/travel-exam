import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getGridFSBucket } from "@/lib/gridfs"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await context.params
    const id = resolvedParams.id

    if (!id || !ObjectId.isValid(id)) {
      return new NextResponse("Invalid file identifier", { status: 400 })
    }

    const bucket = await getGridFSBucket()
    const oid = new ObjectId(id)

    const files = await bucket.find({ _id: oid }).toArray()
    if (!files || files.length === 0) {
      return new NextResponse("File not found in MongoDB storage", { status: 404 })
    }

    const fileDoc = files[0]
    const nodeStream = bucket.openDownloadStream(oid)

    // Convert Node readable stream to Web standard ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk))
        nodeStream.on("end", () => controller.close())
        nodeStream.on("error", (err) => controller.error(err))
      },
      cancel() {
        nodeStream.destroy()
      },
    })

    const contentType = fileDoc.contentType || "image/jpeg"

    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileDoc.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("[Media Route] Error serving file:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
