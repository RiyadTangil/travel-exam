const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { MongoClient } = require("mongodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const nodemailer = require("nodemailer");

// Configuration from environment variables
const args = process.argv.slice(2);
const isProdRequested = args.includes("--prod");
const isLocalRequested = args.includes("--local");
const keepLocal = args.includes("--keep-local");

let MONGODB_URI = process.env.MONGODB_URI;
if (isProdRequested) {
  MONGODB_URI = process.env.MONGODB_URI_PROD;
  console.log("Using production database (explicitly requested via --prod)");
} else if (isLocalRequested) {
  MONGODB_URI = process.env.MONGODB_URI;
  console.log("Using local database (explicitly requested via --local)");
} else {
  // Default to MONGODB_URI_PROD if available, otherwise MONGODB_URI
  MONGODB_URI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
}

const MONGODB_DB = process.env.MONGODB_DB || getDbNameFromUri(MONGODB_URI, "manage_agency");

// S3 / R2 Configuration (falls back to app's S3 config if backup-specific ones aren't set)
const S3_ACCESS_KEY_ID = process.env.BACKUP_S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.BACKUP_S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const S3_REGION = process.env.BACKUP_S3_REGION || process.env.AWS_REGION_NAME || "us-east-1";
const S3_BUCKET = process.env.BACKUP_S3_BUCKET || process.env.AWS_BUCKET_NAME;
const S3_ENDPOINT = process.env.BACKUP_S3_ENDPOINT; // Optional, useful for Cloudflare R2 or MinIO

// Notification Settings
const WEBHOOK_URL = process.env.BACKUP_NOTIFICATION_WEBHOOK; // Slack or Discord webhook
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "support@travelhisab.com";
const ALERT_EMAIL = process.env.BACKUP_ALERT_EMAIL || SMTP_FROM;

// Local temporary directory for backups
const TEMP_DIR = path.join(__dirname, "../tmp-backups");

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

async function main() {
  console.log("=== Starting MongoDB Backup Process ===");
  console.log(`Database: ${MONGODB_DB}`);
  console.log(`Target URI: ${getRedactedUri(MONGODB_URI)}`);
  
  // Ensure temp directory exists
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let backupFilePath = "";
  let backupMethod = "";
  const tempFilesToCleanup = [];

  try {
    // Validate configuration
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not configured");
    if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET) {
      throw new Error("S3 credentials (Access Key, Secret Key, Bucket) are not fully configured");
    }

    // Step 1: Try running mongodump
    const isMongoDumpAvailable = await checkCommandAvailable("mongodump");

    if (isMongoDumpAvailable) {
      backupFilePath = path.join(TEMP_DIR, `${MONGODB_DB}-mongodump-${timestamp}.archive.gz`);
      tempFilesToCleanup.push(backupFilePath);
      try {
        console.log("Using 'mongodump' for high-fidelity BSON backup...");
        await runMongoDump(MONGODB_URI, backupFilePath);
        backupMethod = "mongodump (BSON)";
      } catch (dumpError) {
        console.warn(`mongodump failed: ${dumpError.message}`);
        console.warn("Attempting fallback to programmatic JSON dump...");
        
        backupFilePath = path.join(TEMP_DIR, `${MONGODB_DB}-jsondump-${timestamp}.json.gz`);
        tempFilesToCleanup.push(backupFilePath);
        await runProgrammaticDump(MONGODB_URI, backupFilePath);
        backupMethod = "Programmatic (JSON) [Fallback]";
      }
    } else {
      console.log("'mongodump' not found on this system. Falling back to programmatic JSON dump...");
      backupFilePath = path.join(TEMP_DIR, `${MONGODB_DB}-jsondump-${timestamp}.json.gz`);
      tempFilesToCleanup.push(backupFilePath);
      await runProgrammaticDump(MONGODB_URI, backupFilePath);
      backupMethod = "Programmatic (JSON)";
    }

    // Step 2: Upload to S3 / R2
    console.log(`Uploading backup to S3 bucket '${S3_BUCKET}'...`);
    const s3Key = `backups/${path.basename(backupFilePath)}`;
    await uploadToS3(backupFilePath, s3Key);

    console.log("Backup and upload completed successfully!");
    console.log(`File: ${s3Key}`);
    console.log(`Method: ${backupMethod}`);

  } catch (error) {
    console.error("Backup failed:", error);
    await sendFailureNotification(error.message);
    process.exit(1);
  } finally {
    // Step 3: Clean up local temp files
    if (!keepLocal) {
      for (const file of tempFilesToCleanup) {
        if (fs.existsSync(file)) {
          console.log(`Cleaning up local temporary file: ${path.basename(file)}`);
          fs.unlinkSync(file);
        }
      }
    } else {
      console.log("Skipping cleanup. Local backup files kept in tmp-backups directory.");
    }
    console.log("=== Backup Process Finished ===");
  }
}

/**
 * Check if a shell command is available
 */
function checkCommandAvailable(cmd) {
  return new Promise((resolve) => {
    const checkCmd = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
    exec(checkCmd, (error) => {
      resolve(!error);
    });
  });
}

/**
 * Execute mongodump to create a compressed archive
 */
function runMongoDump(uri, outputPath) {
  return new Promise((resolve, reject) => {
    // Hide credentials in logs, but execute with full URI
    const command = `mongodump --uri="${uri}" --archive="${outputPath}" --gzip`;
    console.log(`Executing: mongodump --uri="***" --archive="${outputPath}" --gzip`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("mongodump stderr:", stderr);
        return reject(new Error(`mongodump failed: ${error.message}`));
      }
      resolve();
    });
  });
}

/**
 * Programmatic fallback: Dump all collections to a single gzipped JSON file
 */
async function runProgrammaticDump(uri, outputPath) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();

    const backupData = {
      metadata: {
        database: db.databaseName,
        exportedAt: new Date().toISOString(),
      },
      collections: {},
    };

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections
      if (colName.startsWith("system.")) continue;

      console.log(`Dumping collection: ${colName}...`);
      const documents = await db.collection(colName).find({}).toArray();
      backupData.collections[colName] = documents;
    }

    // Compress the JSON string to gzip file
    console.log("Compressing data...");
    const jsonString = JSON.stringify(backupData);
    const compressed = zlib.gzipSync(Buffer.from(jsonString));
    fs.writeFileSync(outputPath, compressed);
    console.log("Programmatic dump compression complete.");
  } finally {
    await client.close();
  }
}

/**
 * Upload a file to S3 or S3-compatible storage (like Cloudflare R2)
 */
async function uploadToS3(filePath, s3Key) {
  const s3Config = {
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  };

  // Support custom endpoint (e.g. Cloudflare R2)
  if (S3_ENDPOINT) {
    s3Config.endpoint = S3_ENDPOINT;
  }

  const s3Client = new S3Client(s3Config);
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  const uploadCommand = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: fileStream,
    ContentLength: fileSize,
    ContentType: "application/gzip",
  });

  await s3Client.send(uploadCommand);
}

/**
 * Send alert notifications on failure
 */
async function sendFailureNotification(errorMessage) {
  const subject = `❌ DATABASE BACKUP FAILED: ${MONGODB_DB}`;
  const messageText = `Database backup failed on ${new Date().toUTCString()}.\n\nError details:\n${errorMessage}`;

  console.log("Sending failure notifications...");

  // 1. Webhook Notification (Slack/Discord)
  if (WEBHOOK_URL) {
    try {
      const payload = {
        text: `⚠️ **${subject}**\n\`\`\`\n${errorMessage}\n\`\`\``,
      };
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Webhook alert sent.");
    } catch (e) {
      console.error("Failed to send Webhook notification:", e.message);
    }
  }

  // 2. Email Notification
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM,
        to: ALERT_EMAIL,
        subject: subject,
        text: messageText,
      });
      console.log("Email alert sent.");
    } catch (e) {
      console.error("Failed to send Email notification:", e.message);
    }
  }
}

// Execute script
main();
// npm run db:backup -- --local --keep-local
