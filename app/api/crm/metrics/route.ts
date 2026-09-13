import { NextRequest } from "next/server"
import { getCrmMetricsHandler } from "@/controllers/crmController"

export async function GET(request: NextRequest) {
  return getCrmMetricsHandler(request)
}
