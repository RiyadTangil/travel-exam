import fs from "fs/promises";
import path from "path";
import { connectMongoose } from "../lib/mongoose";
import GovtRegAgency from "../models/govt-reg-agency";

async function migrate() {
  console.log("Starting data migration to main DB...");
  const conn = await connectMongoose();
  console.log("Connected to Main MongoDB.");

  const filePath = path.join(process.cwd(), "data", "reg-travel-agencies.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  const items = jsonData.data || [];

  console.log(`Found ${items.length} items in local JSON file.`);

  // To prevent unique constraint errors if running multiple times, we can use bulkWrite with upsert
  const bulkOps = items.map((item: any) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: item },
      upsert: true
    }
  }));

  if (bulkOps.length > 0) {
    const result = await GovtRegAgency.bulkWrite(bulkOps);
    console.log(`Migration complete! Upserted/Modified ${result.upsertedCount + result.modifiedCount} documents.`);
  } else {
    console.log("No items to migrate.");
  }

  console.log("Closing connection...");
  await conn.disconnect();
  process.exit(0);
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
