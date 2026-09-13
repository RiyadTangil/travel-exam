import { NextRequest } from "next/server"
import { updateCrmTaskHandler, deleteCrmTaskHandler } from "@/controllers/crmTaskController"

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateCrmTaskHandler(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCrmTaskHandler(request, context)
}
