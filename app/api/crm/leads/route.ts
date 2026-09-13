import { NextRequest } from "next/server"
import { listCrmLeadsHandler, createCrmLeadHandler } from "@/controllers/crmController"

export async function GET(request: NextRequest) {
  return listCrmLeadsHandler(request)
}

export async function POST(request: NextRequest) {
  return createCrmLeadHandler(request)
}
