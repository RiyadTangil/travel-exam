const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

// Schema Definition
const AgencySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  agency_name_license: { type: String, required: true },
  business_address_en: { type: String },
  license_expired_date: { type: String },
  facebook_page: { type: String },
  website: { type: String },
  trabillExp: { type: Date },
  is_new: { type: Number },
  emails: [{
    _id: false,
    address: { type: String },
    isDefault: { type: Number, default: 0 }
  }],
  phones: [{
    _id: false,
    number: { type: String },
    isDefault: { type: Number, default: 0 }
  }]
}, { versionKey: false });

const GovtRegAgency = mongoose.models.GovtRegAgency || mongoose.model('GovtRegAgency', AgencySchema, 'govt-reg-agency');

async function connectMongoose() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  const uri = process.env.MONGODB_URI_PROD;
  // const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  const dbName = process.env.MONGODB_DB || "manage_agency";
  await mongoose.connect(uri, { autoIndex: true, dbName });
  return mongoose.connection;
}

const ENDPOINT = 'https://www.regtravelagency.gov.bd/get-list';

function parseArgs(argv) {
  const args = {
    start: 0,
    length: 100,
    max: 0,
    delay: 250,
    search: '',
    cookie: process.env.REG_TRAVEL_COOKIE || '',
    csrf: process.env.REG_TRAVEL_CSRF || '',
    bootstrap: process.env.REG_TRAVEL_BOOTSTRAP !== 'false',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--start') args.start = Number(next);
    else if (arg === '--length') args.length = Number(next);
    else if (arg === '--max') args.max = Number(next);
    else if (arg === '--delay') args.delay = Number(next);
    else if (arg === '--search') args.search = next || '';
    else if (arg === '--cookie') args.cookie = next || '';
    else if (arg === '--csrf') args.csrf = next || '';
    else if (arg === '--no-bootstrap') {
      args.bootstrap = false;
      continue;
    }
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg.startsWith('--')) i += 1;
  }

  if (!Number.isFinite(args.start) || args.start < 0) {
    throw new Error('--start must be a number >= 0');
  }
  if (!Number.isFinite(args.length) || args.length < 1) {
    throw new Error('--length must be a number >= 1');
  }
  if (!Number.isFinite(args.max) || args.max < 0) {
    throw new Error('--max must be a number >= 0');
  }
  if (!Number.isFinite(args.delay) || args.delay < 0) {
    throw new Error('--delay must be a number >= 0');
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  node --env-file=.env scripts/marketting/scrape-reg-travel-agencies.js [options]

Options:
  --start <n>      First DataTables offset. Default: 0
  --length <n>     Rows per request. Default: 100
  --max <n>        Max rows to save. 0 means all rows. Default: 0
  --delay <ms>     Delay between requests. Default: 250
  --search <text>  Optional server-side search value.
  --cookie <text>  Optional Cookie header. Or set REG_TRAVEL_COOKIE.
  --csrf <text>    Optional X-CSRF-TOKEN header. Or set REG_TRAVEL_CSRF.
  --no-bootstrap   Skip homepage request for fresh cookies/CSRF.

Examples:
  node --env-file=.env scripts/marketting/scrape-reg-travel-agencies.js --length 500
  node --env-file=.env scripts/marketting/scrape-reg-travel-agencies.js --start 0 --length 250 --max 6000
`);
}

function buildPayload({ draw, start, length, search }) {
  const params = new URLSearchParams();
  const columns = [
    { data: 'serial_no', name: 'serial_no', searchable: false, orderable: false },
    { data: 'agency_name_license', name: 'agency_name_license', searchable: true, orderable: true },
    { data: 'agency_email_number_website', name: 'agency_email_number_website', searchable: true, orderable: true },
    { data: 'business_address_en', name: 'business_address_en', searchable: true, orderable: true },
  ];

  params.set('draw', String(draw));

  columns.forEach((column, index) => {
    params.set(`columns[${index}][data]`, column.data);
    params.set(`columns[${index}][name]`, column.name);
    params.set(`columns[${index}][searchable]`, String(column.searchable));
    params.set(`columns[${index}][orderable]`, String(column.orderable));
    params.set(`columns[${index}][search][value]`, '');
    params.set(`columns[${index}][search][regex]`, 'false');
  });

  params.set('start', String(start));
  params.set('length', String(length));
  params.set('search[value]', search);
  params.set('search[regex]', 'false');

  return params;
}

function buildHeaders({ cookie, csrf }) {
  const headers = {
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Origin: 'https://www.regtravelagency.gov.bd',
    Referer: 'https://www.regtravelagency.gov.bd/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (cookie) headers.Cookie = cookie;
  if (csrf) headers['X-CSRF-TOKEN'] = csrf;

  return headers;
}

function parseCookieHeader(setCookie) {
  if (!setCookie) return '';
  const cookies = Array.isArray(setCookie) ? setCookie : String(setCookie).split(/,(?=[^;,]+=)/);

  return cookies
    .map((cookie) => cookie.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

function parseCsrfToken(html) {
  const match = String(html).match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  return match?.[1] || '';
}

async function bootstrapSession(args) {
  if (!args.bootstrap || (args.cookie && args.csrf)) return args;

  console.log('Bootstrapping fresh session from homepage...');
  const response = await axios.get('https://www.regtravelagency.gov.bd/', {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    },
    timeout: 30000,
  });

  return {
    ...args,
    cookie: args.cookie || parseCookieHeader(response.headers['set-cookie']),
    csrf: args.csrf || parseCsrfToken(response.data),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanRow(row) {
  if (!row || typeof row !== 'object') return row;

  const cleaned = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, stripHtml(value)])
  );
  
  delete cleaned.is_approved;
  delete cleaned.serial_no;
  delete cleaned.DT_RowId;
  delete cleaned.DT_RowClass;
  
  return cleaned;
}

async function fetchPage(client, options) {
  const payload = buildPayload(options);
  const response = await client.post(ENDPOINT, payload.toString());

  if (!response.data || !Array.isArray(response.data.data)) {
    throw new Error(`Unexpected response shape: ${JSON.stringify(response.data).slice(0, 500)}`);
  }

  return response.data;
}

function processStructuredContacts(agencyString) {
  const parts = (agencyString || "").split('\n').filter(Boolean);
  const emails = [];
  const phones = [];
  let website = "";

  parts.forEach(part => {
    if (part.includes('@')) {
      const match = part.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
      if (match) emails.push({ address: match[0], isDefault: emails.length === 0 ? 1 : 0 });
    } else if (part.includes('www.') || part.includes('http')) {
      if (!website) website = part.trim();
    } else if (/[\d+]/.test(part)) {
      phones.push({ number: part.trim(), isDefault: phones.length === 0 ? 1 : 0 });
    }
  });

  return { emails, phones, website };
}

async function main() {
  await connectMongoose();
  console.log('Connected to MongoDB');

  // Step 1: Bootstrap session (gets initial cookies/CSRF if needed)
  const args = await bootstrapSession(parseArgs(process.argv.slice(2)));
  
  // Step 2: Setup axios client with required headers
  const client = axios.create({
    headers: buildHeaders(args),
    timeout: 30000,
    validateStatus: (status) => status >= 200 && status < 500,
  });

  const rows = [];
  let draw = 1;
  let start = args.start;
  let total = null;
  let filtered = null;

  // Step 3: Loop to fetch all pages sequentially
  while (true) {
    console.log(`Fetching start=${start}, length=${args.length}...`);
    const page = await fetchPage(client, {
      draw,
      start,
      length: args.length,
      search: args.search,
    });

    if (page.error) {
      throw new Error(`API error: ${page.error}`);
    }

    total = Number(page.recordsTotal ?? total ?? 0);
    filtered = Number(page.recordsFiltered ?? filtered ?? total);

    const pageRows = page.data.map(cleanRow);
    const remaining = args.max > 0 ? args.max - rows.length : pageRows.length;
    rows.push(...pageRows.slice(0, remaining));

    console.log(`Received ${pageRows.length}. Saved ${rows.length}/${args.max || filtered || total || 'unknown'}.`);

    if (pageRows.length === 0) break;
    if (args.max > 0 && rows.length >= args.max) break;
    if (filtered && start + pageRows.length >= filtered) break;
    if (pageRows.length < args.length) break;

    start += args.length;
    draw += 1;

    if (args.delay > 0) await sleep(args.delay);
  }

  // Step 4: Check for existing data to determine is_new
  let existingMap = new Map();

  try {
    const existingRecords = await GovtRegAgency.find({}, { id: 1, is_new: 1 }).lean();
    existingRecords.forEach((item) => {
      existingMap.set(item.id, item);
    });
  } catch (e) {
    console.error("Could not read DB for comparison.");
  }

  // Step 5: Merge fetched rows into existingMap
  rows.forEach(row => {
    const existing = existingMap.get(row.id);
    if (existing) {
      // Overwrite existing with newly fetched core fields, but protect custom fields
      const merged = { ...existing, ...row };
      
      Object.keys(existing).forEach(key => {
        if (existing[key] && (row[key] === null || row[key] === undefined || row[key] === "")) {
          merged[key] = existing[key];
        }
      });

      if (existing.is_new !== undefined) merged.is_new = existing.is_new;
      existingMap.set(row.id, merged);
    } else {
      existingMap.set(row.id, { ...row, is_new: 1 });
    }
  });

  const processedRows = Array.from(existingMap.values());

  // Step 6: MongoDB Upsert
  if (processedRows.length > 0) {
    console.log(`Preparing bulk write for ${processedRows.length} rows...`);
    const bulkOps = processedRows.map(row => {
      const { emails, phones, website } = processStructuredContacts(row.agency_email_number_website);
      
      const updateSet = { ...row };
      delete updateSet._id;
      delete updateSet.is_approved;
      delete updateSet.serial_no;
      delete updateSet.DT_RowId;
      delete updateSet.DT_RowClass;
      delete updateSet.agency_email_number_website;

      if (!updateSet.website && website) {
        updateSet.website = website;
      }

      return {
        updateOne: {
          filter: { id: row.id },
          update: {
            $set: updateSet,
            $setOnInsert: {
              emails: row.emails?.length ? undefined : emails,
              phones: row.phones?.length ? undefined : phones
            }
          },
          upsert: true
        }
      };
    });

    try {
      const result = await GovtRegAgency.bulkWrite(bulkOps);
      console.log(`Migration complete! Upserted/Modified ${result.upsertedCount + result.modifiedCount} documents.`);
    } catch (e) {
      console.error("Bulk write failed:", e);
    }
  } else {
    console.log("No data fetched from endpoint.");
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((error) => {
  const status = error.response?.status;
  const body = error.response?.data;

  console.error(status ? `Request failed with HTTP ${status}` : 'Scrape failed');
  console.error(body || error.message);
  process.exit(1);
});
