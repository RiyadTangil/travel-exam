/**
 * Utility to parse Passport Machine Readable Zone (MRZ) compliant with ICAO Doc 9303.
 * Handles cleaning OCR errors, noise-tolerant normalizations, checksum validations,
 * shift-tolerant alignment, chronological date sorting, cross-checking names, and telephone extraction.
 */

export interface ParsedPassport {
  passportNo: string;
  name: string;
  dob: Date | null;
  dateOfExpire: Date | null;
  gender: string;
  nationality: string;
  nid: string;
  paxType: "Adult" | "Child" | "Infant";
  confidence: "High" | "Medium" | "Low";
}

// Clean common digit misreads from OCR in numeric fields
function cleanDigits(str: string): string {
  return str
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/I/g, "1")
    .replace(/L/g, "1")
    .replace(/S/g, "5")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/G/g, "6")
    .replace(/T/g, "7")
    .replace(/[^0-9]/g, "");
}

// Map characters to their numeric values under ICAO 9303 check digit algorithm
function getICAOCharValue(char: string): number {
  if (char >= "0" && char <= "9") {
    return parseInt(char, 10);
  }
  if (char >= "A" && char <= "Z") {
    return char.charCodeAt(0) - 55; // A is 10, B is 11, ... Z is 35
  }
  return 0; // '<' and other separators have value 0
}

// Verify check digit according to ICAO Doc 9303 weight pattern (7, 3, 1)
function verifyCheckDigit(field: string, checkDigitChar: string): boolean {
  if (!checkDigitChar) return false;
  const cleanedCheck = cleanDigits(checkDigitChar);
  const expectedCheckDigit = parseInt(cleanedCheck, 10);
  if (isNaN(expectedCheckDigit)) return false;

  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < field.length; i++) {
    sum += getICAOCharValue(field[i]) * weights[i % 3];
  }
  return sum % 10 === expectedCheckDigit;
}

// Auto-correct common digit misreads to make a check digit pass (e.g. for DOB, Expiry)
function autoCorrectDigits(field: string, checkDigitChar: string): string {
  if (verifyCheckDigit(field, checkDigitChar)) {
    return field;
  }

  const replacements: Record<string, string> = {
    'O': '0', 'I': '1', 'L': '1', 'S': '5', 'B': '8', 'Z': '2', 'G': '6', 'T': '7'
  };

  const chars = field.split("");
  const mappedField = chars.map(c => replacements[c] || c).join("");
  
  if (verifyCheckDigit(mappedField, checkDigitChar)) {
    return mappedField;
  }

  return field;
}

// Auto-correct passport number alphanumeric confusions using check digit
function autoCorrectPassport(passport: string, checkDigitChar: string): string {
  if (verifyCheckDigit(passport, checkDigitChar)) {
    return passport;
  }

  const commonReplacements: [string, string][] = [
    ['O', '0'], ['I', '1'], ['L', '1'], ['S', '5'], ['B', '8'], ['Z', '2'], ['G', '6']
  ];

  let current = passport;
  for (const [from, to] of commonReplacements) {
    current = current.replace(new RegExp(from, 'g'), to);
    if (verifyCheckDigit(current, checkDigitChar)) {
      return current;
    }
  }

  current = passport;
  const letterReplacements: [string, string][] = [
    ['0', 'O'], ['1', 'I'], ['2', 'Z'], ['8', 'B']
  ];
  for (const [from, to] of letterReplacements) {
    current = current.replace(new RegExp(from, 'g'), to);
    if (verifyCheckDigit(current, checkDigitChar)) {
      return current;
    }
  }

  return passport;
}

// Parse YYMMDD format into a Date object
function parseMRZDate(dateStr: string, isExpiry: boolean = false): Date | null {
  const cleaned = cleanDigits(dateStr);
  if (cleaned.length !== 6) return null;

  const yy = parseInt(cleaned.substring(0, 2), 10);
  const mm = parseInt(cleaned.substring(2, 4), 10) - 1; // 0-indexed month
  const dd = parseInt(cleaned.substring(4, 6), 10);

  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;
  if (mm < 0 || mm > 11 || dd < 1 || dd > 31) return null;

  const currentYear = new Date().getFullYear();
  let year = yy;

  if (isExpiry) {
    year += 2000;
  } else {
    if (year + 2000 <= currentYear) {
      year += 2000;
    } else {
      year += 1900;
    }
  }

  const date = new Date(year, mm, dd);
  if (date.getFullYear() !== year || date.getMonth() !== mm || date.getDate() !== dd) {
    return null;
  }

  return date;
}

// Calculate Pax Type based on birth date
export function calculatePaxType(dob: Date): "Adult" | "Child" | "Infant" {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age >= 12) return "Adult";
  if (age >= 2) return "Child";
  return "Infant";
}

// Normalize OCR noise in MRZ lines
export function cleanMRZLine(line: string): string {
  return line
    .toUpperCase()
    .replace(/[\(\)\[\]\{\}\\\/\|!\?†§_]/g, "<")
    .replace(/\s/g, "<")
    .replace(/[^A-Z0-9<]/g, "");
}

// Clean and extract fields from TD3 (44x2) MRZ structure
export function parseMRZ(mrzLines: string[]): ParsedPassport | null {
  if (mrzLines.length < 2) return null;

  const line1 = cleanMRZLine(mrzLines[0]);
  const line2 = cleanMRZLine(mrzLines[1]);

  if (line1.length < 35 || line2.length < 35) return null;

  const l1 = line1.padEnd(44, "<").substring(0, 44);
  const l2 = line2.padEnd(44, "<").substring(0, 44);

  if (l1[0] !== "P") return null;

  // Extract Name (Line 1: chars 5 to 44)
  const nameSection = l1.substring(5);
  const nameParts = nameSection.split("<<");
  const surname = nameParts[0]?.replace(/</g, " ").trim() || "";
  const givenNames = nameParts[1]?.replace(/</g, " ").trim() || "";
  const fullName = [givenNames, surname].filter(Boolean).join(" ");

  // 1. Shift Detection sweep using check digits on Line 2
  let shift = 0;
  let shiftFound = false;

  for (let s = -3; s <= 3; s++) {
    const dobPart = l2.substring(13 + s, 19 + s);
    const dobCheck = l2[19 + s];
    const expPart = l2.substring(21 + s, 27 + s);
    const expCheck = l2[27 + s];

    const dobCleaned = cleanDigits(dobPart);
    const dobCheckClean = cleanDigits(dobCheck);
    const expCleaned = cleanDigits(expPart);
    const expCheckClean = cleanDigits(expCheck);

    if (dobCleaned.length === 6 && verifyCheckDigit(dobCleaned, dobCheckClean)) {
      shift = s;
      shiftFound = true;
      break;
    }
    if (expCleaned.length === 6 && verifyCheckDigit(expCleaned, expCheckClean)) {
      shift = s;
      shiftFound = true;
      break;
    }
  }

  // 2. Secondary shift correction using country code anchor (standard index is 10)
  if (!shiftFound) {
    const countryCode = l1.substring(2, 5).replace(/</g, "");
    if (countryCode && countryCode.length === 3) {
      const idx = l2.indexOf(countryCode);
      if (idx !== -1 && idx >= 7 && idx <= 15) {
        shift = idx - 10;
        shiftFound = true;
      }
    }
  }

  // Extract Passport Number (Line 2: chars 0 to 9 + shift)
  const passportRaw = l2.substring(0, 9 + shift);
  const passportCheckDigit = l2[9 + shift];
  const rawPassportNo = passportRaw.replace(/</g, "").trim();
  const correctedPassportNo = autoCorrectPassport(rawPassportNo, passportCheckDigit);
  const passportNo = correctedPassportNo.replace(/</g, "").trim();

  // Extract Nationality (Line 2: chars 10 to 13 + shift)
  const nationality = l2.substring(10 + shift, 13 + shift).replace(/</g, "").trim();

  // Extract Date of Birth (Line 2: chars 13 to 19 + shift)
  const dobRaw = l2.substring(13 + shift, 19 + shift);
  const dobCheckDigit = l2[19 + shift];
  const correctedDobRaw = autoCorrectDigits(dobRaw, dobCheckDigit);
  const dob = parseMRZDate(correctedDobRaw, false);

  // Extract Gender (Line 2: char 20 + shift)
  const genderRaw = l2[20 + shift];
  let gender = "Unknown";
  if (genderRaw === "M") gender = "Male";
  else if (genderRaw === "F" || genderRaw === "K") gender = "Female";

  // Extract Expiry Date (Line 2: chars 21 to 27 + shift)
  const expiryRaw = l2.substring(21 + shift, 27 + shift);
  const expiryCheckDigit = l2[27 + shift];
  const correctedExpiryRaw = autoCorrectDigits(expiryRaw, expiryCheckDigit);
  const dateOfExpire = parseMRZDate(correctedExpiryRaw, true);

  // Extract NID / Personal Number (Line 2: chars 28 + shift to 42 + shift)
  const personalRaw = l2.substring(28 + shift, 42 + shift);
  const nid = personalRaw.replace(/</g, "").trim();

  const paxType = dob ? calculatePaxType(dob) : "Adult";

  // Validate check digits to score confidence
  const passportCheckPass = verifyCheckDigit(correctedPassportNo, passportCheckDigit);
  const dobCheckPass = verifyCheckDigit(correctedDobRaw, dobCheckDigit);
  const expiryCheckPass = verifyCheckDigit(correctedExpiryRaw, expiryCheckDigit);

  let confidence: "High" | "Medium" | "Low" = "High";
  if (!passportCheckPass || !dobCheckPass || !expiryCheckPass) {
    confidence = "Medium";
  }
  if (!passportNo || !fullName || !dob || !dateOfExpire) {
    confidence = "Low";
  }

  return {
    passportNo,
    name: fullName,
    dob,
    dateOfExpire,
    gender,
    nationality,
    nid: nid.match(/^[0-9A-Z]+$/) ? nid : "",
    paxType,
    confidence,
  };
}

/**
 * Searches raw OCR text for MRZ lines and extracts data.
 */
export function extractPassportData(rawText: string): ParsedPassport | null {
  if (!rawText) return null;

  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 8);

  let mrzLines: string[] = [];
  
  // 1. Search for consecutive rows matching normalized MRZ conditions
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = cleanMRZLine(lines[i]);
    const l2 = cleanMRZLine(lines[i + 1]);

    const l1Arrows = (l1.match(/</g) || []).length;
    const l2Arrows = (l2.match(/</g) || []).length;

    const looksLikeLine1 = l1.startsWith("P") && (l1Arrows >= 5 || l1.length >= 35);
    const looksLikeLine2 = l2.length >= 35 && (l2Arrows >= 1 || /^[A-Z0-9<]+$/.test(l2));

    if (looksLikeLine1 && looksLikeLine2) {
      mrzLines = [lines[i], lines[i + 1]];
      break;
    }
  }

  // 2. Search anywhere for lines containing high concentration of arrows
  if (mrzLines.length === 0) {
    for (let i = 0; i < lines.length - 1; i++) {
      const l1 = lines[i];
      const l2 = lines[i + 1];
      const l1Arrows = (cleanMRZLine(l1).match(/</g) || []).length;
      const l2Arrows = (cleanMRZLine(l2).match(/</g) || []).length;

      if (l1Arrows >= 8 && l2Arrows >= 2 && l1.length >= 30 && l2.length >= 30) {
        mrzLines = [l1, l2];
        break;
      }
    }
  }

  // 3. Fallback: Search anywhere for a line starting with 'P<' or similar
  if (mrzLines.length === 0) {
    const cleanLines = lines.map(cleanMRZLine);
    const pLineIndex = cleanLines.findIndex(l => l.startsWith("P<"));
    if (pLineIndex !== -1 && pLineIndex < lines.length - 1) {
      const nextLine = lines[pLineIndex + 1];
      if (nextLine && nextLine.length >= 30) {
        mrzLines = [lines[pLineIndex], nextLine];
      }
    }
  }

  let parsed = parseMRZ(mrzLines);

  // 4. Fallback to heuristic parser
  if (!parsed) {
    parsed = tryHeuristicParsing(rawText);
  }

  // Cross-check name with plain-text labels to fix any OCR noise in MRZ name
  if (parsed && parsed.name) {
    parsed.name = findCleanNameFallback(rawText, parsed.name);
  }

  return parsed;
}

// Helper to parse string date (e.g. "30 NOV 1999")
function parseTextDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// Regex heuristics to find fields when MRZ is unreadable or absent
function tryHeuristicParsing(text: string): ParsedPassport | null {
  const upperText = text.toUpperCase();

  // 1. Passport Number: look for 9-char string with 1 letter and 8 digits (or 2 letters, 7 digits)
  const passportRegex = /\b([A-Z][0-9]{8}|[A-Z]{2}[0-9]{7})\b/i;
  const passportMatch = text.match(passportRegex);
  const passportNo = passportMatch ? passportMatch[1].toUpperCase() : "";

  // 2. Name extraction (excluding newlines in capture group to prevent overflow)
  const nameRegex = /(?:SURNAME|NAME|FULL\s+NAME|NOM)\s*:?[\s\S]{1,50}?([A-Z][A-Z ]{2,30})/i;
  const nameMatch = text.match(nameRegex);
  let name = nameMatch ? nameMatch[1].trim().replace(/\r?\n/g, " ") : "";
  if (!name) {
    const fallbackName = text.match(/NAME\s*:?\s*([A-Z][A-Z ]{2,30})/i);
    name = fallbackName ? fallbackName[1].trim() : "";
  }

  // 3. Date extraction using Chronological Sorting
  // Matches DD MMM YYYY (e.g. 30 NOV 1999) or DD-MM-YYYY
  const dateRegex = /\b\d{2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4}\b|\b\d{2}[-\/\s.]\d{2}[-\/\s.]\d{4}\b/gi;
  const matches = text.match(dateRegex) || [];
  const uniqueDates: Date[] = [];
  
  for (const m of matches) {
    const d = parseTextDate(m);
    if (d && !uniqueDates.some(ud => ud.getTime() === d.getTime())) {
      uniqueDates.push(d);
    }
  }

  // Sort dates chronologically
  uniqueDates.sort((a, b) => a.getTime() - b.getTime());

  let dob: Date | null = null;
  let dateOfExpire: Date | null = null;

  if (uniqueDates.length >= 3) {
    dob = uniqueDates[0]; // Earliest is DOB
    dateOfExpire = uniqueDates[uniqueDates.length - 1]; // Latest is Expiry
  } else if (uniqueDates.length === 2) {
    dob = uniqueDates[0];
    dateOfExpire = uniqueDates[1];
  } else if (uniqueDates.length === 1) {
    dob = uniqueDates[0];
  }

  // 4. Extract NID
  const nidRegex = /(?:PERSONAL\s*NO\.?|NID|NATIONAL\s*ID)\s*:?\s*([0-9]{10,17})/i;
  const nidMatch = text.match(nidRegex);
  let nid = nidMatch ? nidMatch[1].trim() : "";
  
  if (!nid) {
    const numbers = text.match(/\b\d{10}\b|\b\d{17}\b/g);
    if (numbers) {
      nid = numbers.find(n => n !== passportNo) || "";
    }
  }

  if (!passportNo && !name) return null;

  return {
    passportNo,
    name,
    dob,
    dateOfExpire,
    gender: "Unknown",
    nationality: "BGD",
    nid,
    paxType: dob ? calculatePaxType(dob) : "Adult",
    confidence: "Low"
  };
}

/**
 * Searches the OCR text for "Date of Issue" using chronological sorting.
 */
export function extractIssueDate(rawText: string): Date | null {
  if (!rawText) return null;

  // Chronological sort: middle date of 3 unique dates is the issue date
  const dateRegex = /\b\d{2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{4}\b|\b\d{2}[-\/\s.]\d{2}[-\/\s.]\d{4}\b/gi;
  const matches = rawText.match(dateRegex) || [];
  const uniqueDates: Date[] = [];
  
  for (const m of matches) {
    const d = new Date(m);
    if (!isNaN(d.getTime()) && !uniqueDates.some(ud => ud.getTime() === d.getTime())) {
      uniqueDates.push(d);
    }
  }

  uniqueDates.sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDates.length >= 3) {
    return uniqueDates[1]; // Middle is Issue Date
  }

  // Fallback to label-based regex
  const issueRegex = /(?:DATE\s+OF\s+ISSUE|ISSUE\s+DATE|DOI|DATE\s+D\s+EMISSION)[\s\S]{1,50}?([0-9]{2}\s+[A-Z]{3}\s+[0-9]{4})/i;
  const match = rawText.match(issueRegex);
  if (match) {
    const date = new Date(match[1].trim());
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Searches the entire OCR text for a mobile or telephone number.
 */
export function extractMobileNumber(rawText: string): string {
  if (!rawText) return "";

  const phoneLabels = /(?:TELEPHONE\s*NO\.?|TEL\s*NO\.?|TELEPHONE|MOBILE\s*NO\.?|MOBILE|PHONE\s*NO\.?|PHONE)\s*:?\s*([\+\d\s-]{8,20})/i;
  const match = rawText.match(phoneLabels);
  if (match) {
    const cleaned = match[1].replace(/[\s-]/g, "").trim();
    if (/^\+?[0-9]{8,15}$/.test(cleaned)) {
      return cleaned;
    }
  }

  const bdPhoneRegex = /(\+?88)?01[3-9][0-9]{8}\b/g;
  const bdMatch = rawText.match(bdPhoneRegex);
  if (bdMatch && bdMatch.length > 0) {
    return bdMatch[0].replace(/[\s-]/g, "");
  }

  return "";
}

/**
 * Extracts a clean Name by combining Given Name and Surname from standard passport labels.
 */
export function extractPageName(rawText: string): string {
  if (!rawText) return "";

  const lines = rawText.split(/\r?\n/).map(l => l.trim());
  let surname = "";
  let givenName = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // Skip family member names to prevent mix-ups
    if (
      upperLine.includes("FATHER") ||
      upperLine.includes("MOTHER") ||
      upperLine.includes("SPOUSE") ||
      upperLine.includes("GUARDIAN")
    ) {
      continue;
    }

    // Match Surname Label
    if (upperLine.includes("SURNAME") || upperLine.includes("NOM")) {
      const match = line.match(/(?:SURNAMES?|NOMS?)\s*:?\s+([A-Z][A-Z ]{2,30})/i);
      if (match) {
        surname = match[1].trim().toUpperCase();
      } else if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextLineUpper = nextLine.toUpperCase();
        if (!nextLineUpper.includes("NAME") && !nextLineUpper.includes("SURNAME") && !nextLineUpper.includes("GIVEN")) {
          const nextMatch = nextLine.match(/^([A-Z][A-Z ]{2,30})$/i);
          if (nextMatch) {
            surname = nextMatch[1].trim().toUpperCase();
          }
        }
      }
    }

    // Match Given Name Label
    if (
      upperLine.includes("GIVEN") ||
      upperLine.includes("PRENOM")
    ) {
      const match = line.match(/(?:GIVEN\s*NAMES?|PRENOMS?|GIVEN(?!\s*NAME))\s*:?\s+([A-Z][A-Z ]{2,30})/i);
      if (match) {
        givenName = match[1].trim().toUpperCase();
      } else if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextLineUpper = nextLine.toUpperCase();
        if (!nextLineUpper.includes("NAME") && !nextLineUpper.includes("SURNAME") && !nextLineUpper.includes("GIVEN")) {
          const nextMatch = nextLine.match(/^([A-Z][A-Z ]{2,30})$/i);
          if (nextMatch) {
            givenName = nextMatch[1].trim().toUpperCase();
          }
        }
      }
    }
  }

  if (givenName && surname) {
    return `${givenName} ${surname}`;
  }
  if (givenName) return givenName;
  if (surname) return surname;

  return "";
}

/**
 * Sweeps candidate names from raw plain text to align and correct OCR errors in MRZ names.
 */
export function findCleanNameFallback(rawText: string, mrzName: string): string {
  if (!rawText) return mrzName;

  // 1. Try to extract clean Surname + Given Name from the page body (primary clean source)
  const pageName = extractPageName(rawText);
  if (pageName && pageName.length > 5) {
    const mrzWords = mrzName.toUpperCase().split(/[^A-Z]/).filter(w => w.length > 2);
    const pageWords = pageName.split(/\s+/).filter(w => w.length > 2);
    
    let overlap = 0;
    for (const w of pageWords) {
      if (mrzWords.some(mw => mw.includes(w) || w.includes(mw) || levenshteinDistance(w, mw) <= 2)) {
        overlap++;
      }
    }
    
    if (overlap > 0) {
      return pageName;
    }
  }

  // 2. Fallback to standard line-by-line label matching
  const lines = rawText.split(/\r?\n/);
  const candidates: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    if (
      upperLine.includes("FATHER") ||
      upperLine.includes("MOTHER") ||
      upperLine.includes("SPOUSE") ||
      upperLine.includes("GUARDIAN")
    ) {
      continue;
    }

    const sameLineMatch = line.match(/(?:NAME|GIVEN\s+NAME|SURNAME|FULL\s+NAME)\s*:?\s*([A-Z][A-Z ]{2,35})/i);
    if (sameLineMatch) {
      const clean = sameLineMatch[1].trim().toUpperCase();
      if (clean && clean.length > 5 && !clean.includes("ADDRESS") && !clean.includes("PASSPORT")) {
        candidates.push(clean);
      }
    } else {
      const labelMatch = line.match(/(?:NAME|GIVEN\s+NAME|SURNAME|FULL\s+NAME)\s*:?\s*$/i);
      if (labelMatch && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextLineMatch = nextLine.match(/^([A-Z][A-Z ]{2,35})$/i);
        if (nextLineMatch) {
          const clean = nextLineMatch[1].trim().toUpperCase();
          if (clean && clean.length > 5 && !clean.includes("ADDRESS") && !clean.includes("PASSPORT")) {
            candidates.push(clean);
          }
        }
      }
    }
  }

  if (candidates.length === 0) return mrzName;

  const mrzWords = mrzName.toUpperCase().split(/[^A-Z]/).filter(w => w.length > 2);
  if (mrzWords.length === 0) return candidates[0] || mrzName;

  let bestCandidate = mrzName;
  let maxOverlap = 0;

  for (const cand of candidates) {
    const candWords = cand.split(/\s+/).filter(w => w.length > 2);
    let overlap = 0;
    for (const w of candWords) {
      if (mrzWords.some(mw => mw.includes(w) || w.includes(mw) || levenshteinDistance(w, mw) <= 2)) {
        overlap++;
      }
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestCandidate = cand;
    }
  }

  if (maxOverlap > 0) {
    return bestCandidate;
  }

  // Fallback to the first captured clean name if there's no word overlap with a garbled MRZ name
  if (candidates.length > 0) {
    return candidates[0];
  }

  return mrzName;
}

// Simple Levenshtein distance for word matching
function levenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j, val;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      val = (a[i-1] === b[j-1]) ? 0 : 1;
      tmp[i][j] = Math.min(tmp[i-1][j] + 1, tmp[i][j-1] + 1, tmp[i-1][j-1] + val);
    }
  }
  return tmp[a.length][b.length];
}
