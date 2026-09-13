const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { MongoClient } = require("mongodb");

// Parse command line arguments
const args = process.argv.slice(2);
const isProdRequested = args.includes("--prod");
const isLocalRequested = args.includes("--local");
const shouldDrop = args.includes("--drop");

// Find custom database name option, e.g., --db=manage_agency_test
const dbArg = args.find(a => a.startsWith("--db="));
const customDbName = dbArg ? dbArg.split("=")[1] : null;

// Find file path argument (anything that doesn't start with --)
let backupFilePath = args.find(a => !a.startsWith("-"));

// Configuration from environment variables
let MONGODB_URI = process.env.MONGODB_URI;
if (isProdRequested) {
  MONGODB_URI = process.env.MONGODB_URI_PROD;
  console.log("Target: Production database (explicitly requested via --prod)");
} else if (isLocalRequested) {
  MONGODB_URI = process.env.MONGODB_URI;
  console.log("Target: Local database (explicitly requested via --local)");
} else {
  // Default to MONGODB_URI_PROD if available, otherwise MONGODB_URI
  MONGODB_URI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
}

const TEMP_DIR = path.join(__dirname, "../tmp-backups");
const MONGODB_DB = customDbName || process.env.MONGODB_DB || getDbNameFromUri(MONGODB_URI, "manage_agency");

/**
 * Redact password from connection string for safe logging
 */
function getRedactedUri(uri) {
  if (!uri) return "undefined";
  return uri.replace(/:([^:@]+)@/, ":******@");
}

/**
 * Get database name from connection string
 */
function getDbNameFromUri(uri, defaultDb) {
  if (!uri) return defaultDb;
  try {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : defaultDb;
  } catch (e) {
    return defaultDb;
  }
}

/**
 * Find the latest backup file in the tmp-backups directory
 */
function findLatestBackup() {
  if (!fs.existsSync(TEMP_DIR)) return null;
  const files = fs.readdirSync(TEMP_DIR)
    .filter(f => f.endsWith(".gz"))
    .map(f => ({
      name: f,
      path: path.join(TEMP_DIR, f),
      time: fs.statSync(path.join(TEMP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? files[0].path : null;
}

async function main() {
  console.log("=== Starting MongoDB Restore Process ===");

  try {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not configured");

    // If no backup file was specified, find the latest one automatically
    if (!backupFilePath) {
      console.log(`No backup file specified. Searching in ${TEMP_DIR}...`);
      backupFilePath = findLatestBackup();
      if (!backupFilePath) {
        throw new Error(`No backup files found in ${TEMP_DIR}. Please specify a file path.`);
      }
    }

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found at: ${backupFilePath}`);
    }

    console.log(`Backup File: ${path.basename(backupFilePath)}`);
    console.log(`Target Database: ${MONGODB_DB}`);
    console.log(`Target URI: ${getRedactedUri(MONGODB_URI)}`);
    if (shouldDrop) {
      console.log("⚠️  Option --drop enabled: Existing collections will be dropped before restore.");
    }

    // Determine backup type from file extension
    if (backupFilePath.endsWith(".archive.gz")) {
      console.log("Detected BSON Archive. Restoring using 'mongorestore'...");
      await restoreBsonArchive(MONGODB_URI, MONGODB_DB, backupFilePath, shouldDrop);
    } else if (backupFilePath.endsWith(".json.gz")) {
      console.log("Detected Programmatic JSON Backup. Restoring programmatically...");
      await restoreJsonBackup(MONGODB_URI, MONGODB_DB, backupFilePath, shouldDrop);
    } else {
      throw new Error("Unsupported backup file format. Must be .archive.gz or .json.gz");
    }

    console.log("Database restore completed successfully!");

  } catch (error) {
    console.error("❌ Restore failed:", error.message);
    process.exit(1);
  } finally {
    console.log("=== Restore Process Finished ===");
  }
}

/**
 * Restore BSON archive using mongorestore
 */
function restoreBsonArchive(uri, targetDb, archivePath, drop) {
  return new Promise((resolve, reject) => {
    const originalDb = getDbNameFromUri(uri, "manage_agency");
    let command = `mongorestore --uri="${uri}" --archive="${archivePath}" --gzip`;
    
    // If restoring to a different database name
    if (originalDb !== targetDb) {
      command += ` --nsFrom="${originalDb}.*" --nsTo="${targetDb}.*"`;
    }

    if (drop) {
      command += " --drop";
    }

    console.log(`Executing: mongorestore --uri="***" --archive="${path.basename(archivePath)}" --gzip ${originalDb !== targetDb ? `--nsFrom="${originalDb}.*" --nsTo="${targetDb}.*"` : ""}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("mongorestore stderr:", stderr);
        return reject(new Error(`mongorestore failed: ${error.message}`));
      }
      resolve();
    });
  });
}

/**
 * Restore JSON backup programmatically
 */
async function restoreJsonBackup(uri, targetDb, jsonPath, drop) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(targetDb);

    console.log("Decompressing backup file...");
    const fileBuffer = fs.readFileSync(jsonPath);
    const decompressed = zlib.gunzipSync(fileBuffer);
    const backupData = JSON.parse(decompressed.toString());

    const collections = Object.keys(backupData.collections);
    console.log(`Found ${collections.length} collections in backup.`);

    for (const colName of collections) {
      const documents = backupData.collections[colName];
      if (!documents || documents.length === 0) {
        console.log(`Collection '${colName}' is empty. Skipping.`);
        continue;
      }

      const collection = db.collection(colName);

      if (drop) {
        console.log(`Dropping existing collection '${colName}'...`);
        try {
          await collection.drop();
        } catch (err) {
          // Ignore error if collection doesn't exist
          if (err.codeName !== "NamespaceNotFound") throw err;
        }
      }

      console.log(`Restoring ${documents.length} documents into '${colName}'...`);
      
      // Convert date strings back to Date objects if needed
      const parsedDocs = documents.map(doc => {
        // Simple recursive helper to restore Date objects
        return restoreDateObjects(doc);
      });

      await collection.insertMany(parsedDocs);
    }
  } finally {
    await client.close();
  }
}

/**
 * Helper to recursively restore ISO date strings back into JavaScript Date objects
 */
function restoreDateObjects(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "string") {
    // Check if it's an ISO date string
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (isoDateRegex.test(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) return date;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => restoreDateObjects(item));
  }

  if (typeof obj === "object") {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = restoreDateObjects(obj[key]);
    }
    return newObj;
  }

  return obj;
}

// Execute script
main();
