import { NextRequest } from "next/server"
import {
  getCrmLeadByIdHandler,
  updateCrmLeadHandler,
  deleteCrmLeadHandler,
} from "@/controllers/crmController"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return getCrmLeadByIdHandler(request, context)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateCrmLeadHandler(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCrmLeadHandler(request, context)
}
