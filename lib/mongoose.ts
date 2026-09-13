import mongoose, {
  type ConnectOptions,
  type Mongoose,
} from "mongoose"
import { MONGODB_DB_NAME } from "@/lib/database-config"

// Static import allows Next.js to discover and bundle model modules reliably.
import "@/models/register-models"

type MongooseCache = {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
  uri: string | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
  // eslint-disable-next-line no-var
  var _mongooseListenersRegistered: boolean | undefined
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
  uri: null,
}

global._mongooseCache = cache

if (!global._mongooseListenersRegistered) {
  mongoose.connection.on("connected",    () => console.info("[MongoDB] Connected"))
  mongoose.connection.on("disconnected", () => console.warn("[MongoDB] Disconnected"))
  mongoose.connection.on("reconnected",  () => console.info("[MongoDB] Reconnected"))
  mongoose.connection.on("error", (err)  => console.error("[MongoDB] Connection error:", err))
  global._mongooseListenersRegistered = true
}

function getConnectionOptions(): ConnectOptions {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  )

  return {
    dbName: MONGODB_DB_NAME,

    // Manage production indexes through a controlled migration script.
    autoIndex: process.env.NODE_ENV !== "production",

    maxPoolSize: isServerless ? 5 : 10,
    minPoolSize: 0,

    // Serverless: release connections idle for 60 seconds.
    // Long-running servers: 0 disables idle-time-based cleanup.
    maxIdleTimeMS: isServerless ? 60_000 : 0,

    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    waitQueueTimeoutMS: 10_000,

    retryWrites: true,
    retryReads: true,
  }
}

/**
 * Helper to get the current number of active connections from the Mongoose client topology.
 */
export function getActiveConnectionsCount(): number {
  try {
    const client = mongoose.connection?.getClient() as any
    if (!client || !client.topology) return 0
    const s = client.topology.s
    if (!s || !s.servers) return 0

    let count = 0
    for (const server of s.servers.values()) {
      const pool = server.pool
      if (pool && pool.connections && typeof pool.connections.length === "number") {
        count += pool.connections.length
      }
    }
    return count
  } catch (err) {
    console.warn("[MongoDB] Error getting connection count:", err)
    return 0
  }
}

/**
 * Return the single default Mongoose instance used by this runtime.
 *
 * This application supports one MongoDB URI per process.
 * Tenants are isolated using companyId rather than separate URIs.
 */
export function connectMongoose(): Promise<Mongoose> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    return Promise.reject(
      new Error("MONGODB_URI environment variable is not defined")
    )
  }

  if (cache.uri && cache.uri !== uri) {
    return Promise.reject(
      new Error(
        "connectMongoose() supports one MongoDB URI per runtime. " +
        "Use mongoose.createConnection() with connection-specific models " +
        "for concurrent multi-URI access."
      )
    )
  }

  /*
   * Once the initial connection succeeds, reuse the same Mongoose instance.
   * The MongoDB driver manages temporary disconnections and topology changes.
   */
  if (cache.conn) {
    // const count = getActiveConnectionsCount()
    // console.info(`[MongoDB] connectMongoose: Connection cached. Active connections in pool: ${count}`)
    return Promise.resolve(cache.conn)
  }

  // Share the initial connection attempt among concurrent requests.
  if (cache.promise) {
    return cache.promise
  }

  cache.uri = uri

  cache.promise = mongoose
    .connect(uri, getConnectionOptions())
    .then((connection) => {
      cache.conn = connection

      /*
      try {
        const client = connection.getClient()
        client.on("connectionCreated", (event) => {
          const count = getActiveConnectionsCount()
          console.info(`[MongoDB Pool] Connection created (socket ID: ${event?.connectionId}). Active connections: ${count}`)
        })
        client.on("connectionClosed", (event) => {
          const count = getActiveConnectionsCount()
          console.info(`[MongoDB Pool] Connection closed (socket ID: ${event?.connectionId}, reason: ${event?.reason}). Active connections: ${count}`)
        })
      } catch (err) {
        console.warn("[MongoDB] Failed to attach pool event listeners:", err)
      }

      const count = getActiveConnectionsCount()
      console.info(`[MongoDB] Initial connection established. Active connections in pool: ${count}`)
      */
      return connection
    })
    .catch((error: unknown) => {
      cache.conn = null
      cache.uri = null

      console.error("[MongoDB] Initial connection failed:", error)
      throw error
    })
    .finally(() => {
      // This promise is only the initial-connection mutex.
      cache.promise = null
    })

  return cache.promise
}

export default connectMongoose
