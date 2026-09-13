import { RateLimit } from "@/models/rate-limit"
import { connectMongoose } from "@/lib/mongoose"
import { AppError } from "@/errors/AppError"

export interface RateLimitConfig {
  points: number      // Maximum attempts
  duration: number    // Time window in seconds
  actionName: string  // For error message
}

export async function checkRateLimit(key: string, config: RateLimitConfig) {
  await connectMongoose()

  const now = new Date()
  const rateLimit = await RateLimit.findOne({ key })

  if (rateLimit) {
    if (rateLimit.points >= config.points) {
      const timeLeft = Math.ceil((rateLimit.expireAt.getTime() - now.getTime()) / 1000)
      if (timeLeft > 0) {
        throw new AppError(
          `Too many ${config.actionName} attempts. Please try again in ${timeLeft} seconds.`,
          429
        )
      } else {
        // Reset if expired but TTL index hasn't cleaned it yet
        await RateLimit.deleteOne({ key })
      }
    }
  }
}

export async function incrementRateLimit(key: string, config: RateLimitConfig) {
  await connectMongoose()

  const now = new Date()
  const expireAt = new Date(now.getTime() + config.duration * 1000)

  await RateLimit.findOneAndUpdate(
    { key },
    { 
      $inc: { points: 1 },
      $setOnInsert: { expireAt }
    },
    { upsert: true, new: true }
  )
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}
