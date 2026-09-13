import { MongoClient, type Db } from "mongodb"
import { MONGODB_DB_NAME } from "@/lib/database-config"
import connectMongoose from "./mongoose"

// Share the underlying MongoClient from Mongoose so both use the same connection pool.
const clientPromise: Promise<MongoClient> = connectMongoose().then((mongooseInstance) => {
  return mongooseInstance.connection.getClient() as unknown as MongoClient
})

// Named export for connectToDatabase function
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db(MONGODB_DB_NAME)
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to database:", error)
    throw error
  }
}


// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.

export default clientPromise
