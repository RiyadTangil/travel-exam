import { Schema, model, models } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true }, // e.g., "login:ip:127.0.0.1" or "login:email:test@test.com"
  points: { type: Number, default: 0 },
  expireAt: { type: Date, required: true },
}, { 
  ...baseSchemaOptions,
  collection: "rate_limits" 
})

// TTL index to automatically delete records after expireAt
RateLimitSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

export const RateLimit = models.RateLimit || model("RateLimit", RateLimitSchema)
