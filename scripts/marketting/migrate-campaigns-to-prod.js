const { MongoClient } = require("mongodb");

const SOURCE_URI = "mongodb+srv://manage_agency:Ri11559988@cluster0.oq5xc.mongodb.net/manage_agency?retryWrites=true&w=majority&appName=Cluster0";
const DEST_URI = "mongodb+srv://agency_book:Ri11559988@cluster0.fmh8nwc.mongodb.net/manage_agency?retryWrites=true&w=majority&appName=Cluster0";

const COLLECTIONS = [
  { name: "govt-reg-agency", label: "GovtRegAgency" },
  { name: "marketingcampaigns", label: "MarketingCampaign" },
  { name: "agencycommunications", label: "AgencyCommunication" }
];

async function run() {
  console.log("==================================================");
  console.log("STARTING DB MIGRATION FOR CAMPAIGN DATA");
  console.log("==================================================");
  console.log(`Source DB:      ${SOURCE_URI.split("@")[1].split("?")[0]}`);
  console.log(`Destination DB: ${DEST_URI.split("@")[1].split("?")[0]}`);
  console.log("==================================================");

  const sourceClient = new MongoClient(SOURCE_URI);
  const destClient = new MongoClient(DEST_URI);

  try {
    await sourceClient.connect();
    await destClient.connect();

    const sourceDb = sourceClient.db();
    const destDb = destClient.db();

    for (const col of COLLECTIONS) {
      console.log(`\n[+] Migrating ${col.label} (${col.name})...`);
      
      const sourceCol = sourceDb.collection(col.name);
      const destCol = destDb.collection(col.name);

      const docs = await sourceCol.find({}).toArray();
      console.log(`    Found ${docs.length} documents in source.`);

      if (docs.length === 0) {
        console.log("    No documents found. Skipping.");
        continue;
      }

      // Clear existing records in destination to avoid duplicates/unique constraints
      console.log("    Clearing existing documents in destination...");
      const deleteRes = await destCol.deleteMany({});
      console.log(`    Deleted ${deleteRes.deletedCount} old documents from destination.`);

      // Insert all documents
      console.log(`    Inserting ${docs.length} documents to destination...`);
      const insertRes = await destCol.insertMany(docs);
      console.log(`    Successfully migrated ${insertRes.insertedCount} documents.`);
    }

    console.log("\n==================================================");
    console.log("MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (error) {
    console.error("\n[!] Migration failed with error:", error);
  } finally {
    await sourceClient.close();
    await destClient.close();
  }
}

run();
