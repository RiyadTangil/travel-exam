import { NextResponse } from "next/server"

export function ok(data: any, status = 200, message = "Success", meta?: any) {
  return NextResponse.json({
    success: true,
    message,
    statusCode: status,
    data,
    meta,
    error: {}
  }, { status })
}

export function fail(error: any, status = 500) {
  let message = "Operation failed"
  let errorPayload = error

  if (typeof error === "string") {
    message = error
    errorPayload = { message: error }
  } else if (error instanceof Error) {
    message = error.message
    errorPayload = { 
      message: error.message,
      name: error.name,
      // Handle MongoDB duplicate key errors (E11000)
      code: (error as any).code,
      keyPattern: (error as any).keyPattern,
      keyValue: (error as any).keyValue
    }

    // Improve duplicate key message
    if ((error as any).code === 11000) {
      status = 400
      const keys = Object.keys((error as any).keyPattern || {}).join(", ")
      message = `Duplicate entry detected for: ${keys}. Please use a unique value.`
    }
  } else if (error && typeof error === "object") {
    message = error.message || error.error || message
  }
  
  return NextResponse.json({
    success: false,
    message,
    statusCode: status,
    data: {},
    meta: {},
    error: errorPayload
  }, { status })
}

export function notFound(message = "Not found") {
  return fail({ error: "not_found", message }, 404)
}

export function badRequest(message = "Bad request") {
  return fail({ error: "bad_request", message }, 400)
}
