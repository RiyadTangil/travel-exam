import { NextRequest } from "next/server"
import { listCrmTasksHandler, createCrmTaskHandler } from "@/controllers/crmTaskController"

export async function GET(request: NextRequest) {
  return listCrmTasksHandler(request)
}

export async function POST(request: NextRequest) {
  return createCrmTaskHandler(request)
}
