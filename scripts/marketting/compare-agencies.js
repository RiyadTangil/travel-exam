const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', 'reg-travel-agencies.json');
const PROD_API_URL = 'https://travelhisab.com/api/admin/registered-agencies';

const PROD_COOKIE = `__Host-next-auth.csrf-token=e9bb10823d89a068aa7b554b85567d4808197f94603add2ccad7b3b6b3320bb5%7C62e6c60491930c5631d90ee57c098e2145ee629877ddf70b190fb2d80ec66110; __Secure-next-auth.callback-url=https%3A%2F%2Ftravelhisab.com%2Fauth%2Fsignin%3FcallbackUrl%3D%2Fdashboard; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..GB3xlEX9zzJcOW1c.pa5p316Ejg43LnFLzKpatib74QkvUjLuumXyUexSqCuRtHb5vovvzGyYin5TYNcHw_xkoWELpbbmBDe4ynb4j_qPSEW_17-AWgscwoKP-skBVQlDbHP9qRqKhC9rUxLnST9tfFq0tyoZe6XHGw8rwCUQV0SczdM04XrUuMGH3aXhzm9r06gmkNxs_RMSxbQCUN3PpEzD6sLa51nQg6Wwom-4C_4RpE-hilepD-TZovD1w2KhM3i-RFmqr6Bkmf_LChK3nmo77kWsCSEI3BkoTUhSX_LsCKGcgdcw2BWyvYxw3KH0DDEVk7erl9G3NAg21G-wIK6BdEwn3-7p27wtdec9oqF6J7Dg-bo5ElVlEou3lSRmI5p8ix_0kRgKKnPgz25s6qweQIBN3Y99_2mPe_iIFNz7IJxq1zbSyv106cZ4QsV66zsVb5JBj975M-dY3gQmIWplCX7prVZxxnLDbiK5nDZy0eXsBcS9OhKC_DIpkTYm6iIrqaKYE5GwoEYJr-KlwWJCedR9HmohcfwiQBjOhUUtE1sADriOJbjXqfn46_018H-U7MhwXI89VIA0KydwgsSu7YmKbIervWFz9Q2aplCLTh5AcPFvkBM1i4XwXOzwRwyHFkcOrpvSdRhxGymckICLLP9R0PU_iYV63Rg16bxGCOLilF-D5wT9L3nzjdiJkIQ7EoXbOSwW1PuV5UH86ADB5rEItOzBLLqkn1i9JzIk0I_iTA9v16SULLfX1HpxDo0.s8kkt3GFhK3Hgn8FVH38MQ`;

const HEADERS_PROD = {
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.9,bn;q=0.8',
  'content-type': 'application/json',
  'cookie': PROD_COOKIE,
  'referer': 'https://travelhisab.com/admin/registered-agencies',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
};

async function fetchProdData() {
  console.log(`Fetching production data from ${PROD_API_URL}...`);
  try {
    // We use a high limit to fetch all records at once since the backend just slices an array.
    const response = await axios.get(`${PROD_API_URL}?page=1&limit=10000`, {
      headers: HEADERS_PROD,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data.items || [];
    } else {
      console.error("Failed to parse production response:", response.data);
      return [];
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication required! Please update PROD_SESSION_COOKIE in this script with a valid token.");
    } else {
      console.error("Error fetching production data:", error.response?.data || error.message);
    }
    return [];
  }
}

function loadLocalData() {
  console.log(`Loading local data from ${LOCAL_DATA_PATH}...`);
  try {
    const content = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
    const json = JSON.parse(content);
    return json.data || [];
  } catch (error) {
    console.error("Error loading local data:", error.message);
    return [];
  }
}

async function main() {
  // Load local data
  const localItems = loadLocalData();
  const localMap = new Map(localItems.map(item => [item.id, item]));

  // Fetch production data
  const prodItems = await fetchProdData();
  if (prodItems.length === 0) {
    console.log("No data fetched from production. Exiting comparison.");
    return;
  }
  const prodMap = new Map(prodItems.map(item => [item.id, item]));

  console.log('----------------------------------------------------');
  console.log(`Local Records: ${localItems.length}`);
  console.log(`Production Records: ${prodItems.length}`);
  console.log('----------------------------------------------------');

  // Compare: In Local but NOT in Prod
  const onlyInLocal = [];
  for (const localItem of localItems) {
    if (!prodMap.has(localItem.id)) {
      onlyInLocal.push(localItem);
    }
  }

  // Compare: In Prod but NOT in Local
  const onlyInProd = [];
  for (const prodItem of prodItems) {
    if (!localMap.has(prodItem.id)) {
      onlyInProd.push(prodItem);
    }
  }

  // Print results
  console.log(`Agencies ONLY in Local (${onlyInLocal.length}):`);
  if (onlyInLocal.length > 0) {
    onlyInLocal.slice(0, 10).forEach(item => {
      console.log(`  - [${item.id}] ${item.agency_name_license?.split('\n')[0]}`);
    });
    if (onlyInLocal.length > 10) console.log(`  ... and ${onlyInLocal.length - 10} more`);
  } else {
    console.log("  None.");
  }

  console.log('\n----------------------------------------------------');
  console.log(`Agencies ONLY in Production (${onlyInProd.length}):`);
  if (onlyInProd.length > 0) {
    onlyInProd.slice(0, 10).forEach(item => {
      console.log(`  - [${item.id}] ${item.agency_name_license?.split('\n')[0]}`);
    });
    if (onlyInProd.length > 10) console.log(`  ... and ${onlyInProd.length - 10} more`);
  } else {
    console.log("  None.");
  }
  console.log('----------------------------------------------------\n');
}

main();
