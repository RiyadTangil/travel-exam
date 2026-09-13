/**
 * Centralized Country List and Numeric Enums
 *
 * Contains all countries of the world with numeric IDs and ISO 2-letter codes.
 * DB storage is optimized using numeric IDs while frontend UI renders clean country names.
 */

export interface CountryOption {
  id: number
  code: string
  name: string
}

export const COUNTRIES: CountryOption[] = [
  // Top / Popular Travel & Visa Destinations (Priority IDs 1-25)
  { id: 1, code: "SA", name: "Saudi Arabia" },
  { id: 2, code: "KW", name: "Kuwait" },
  { id: 3, code: "AE", name: "United Arab Emirates (UAE)" },
  { id: 4, code: "QA", name: "Qatar" },
  { id: 5, code: "OM", name: "Oman" },
  { id: 6, code: "BH", name: "Bahrain" },
  { id: 7, code: "MY", name: "Malaysia" },
  { id: 8, code: "SG", name: "Singapore" },
  { id: 9, code: "TH", name: "Thailand" },
  { id: 10, code: "IN", name: "India" },
  { id: 11, code: "CN", name: "China" },
  { id: 12, code: "TR", name: "Turkey" },
  { id: 13, code: "GB", name: "United Kingdom" },
  { id: 14, code: "US", name: "United States (USA)" },
  { id: 15, code: "CA", name: "Canada" },
  { id: 16, code: "EU", name: "Schengen Area" },
  { id: 17, code: "IT", name: "Italy" },
  { id: 18, code: "JP", name: "Japan" },
  { id: 19, code: "KR", name: "South Korea" },
  { id: 20, code: "EG", name: "Egypt" },
  { id: 21, code: "BD", name: "Bangladesh" },
  { id: 22, code: "PK", name: "Pakistan" },
  { id: 23, code: "ID", name: "Indonesia" },
  { id: 24, code: "PH", name: "Philippines" },
  { id: 25, code: "VN", name: "Vietnam" },

  // A
  { id: 26, code: "AF", name: "Afghanistan" },
  { id: 27, code: "AL", name: "Albania" },
  { id: 28, code: "DZ", name: "Algeria" },
  { id: 29, code: "AD", name: "Andorra" },
  { id: 30, code: "AO", name: "Angola" },
  { id: 31, code: "AG", name: "Antigua and Barbuda" },
  { id: 32, code: "AR", name: "Argentina" },
  { id: 33, code: "AM", name: "Armenia" },
  { id: 34, code: "AU", name: "Australia" },
  { id: 35, code: "AT", name: "Austria" },
  { id: 36, code: "AZ", name: "Azerbaijan" },

  // B
  { id: 37, code: "BS", name: "Bahamas" },
  { id: 38, code: "BB", name: "Barbados" },
  { id: 39, code: "BY", name: "Belarus" },
  { id: 40, code: "BE", name: "Belgium" },
  { id: 41, code: "BZ", name: "Belize" },
  { id: 42, code: "BJ", name: "Benin" },
  { id: 43, code: "BT", name: "Bhutan" },
  { id: 44, code: "BO", name: "Bolivia" },
  { id: 45, code: "BA", name: "Bosnia and Herzegovina" },
  { id: 46, code: "BW", name: "Botswana" },
  { id: 47, code: "BR", name: "Brazil" },
  { id: 48, code: "BN", name: "Brunei" },
  { id: 49, code: "BG", name: "Bulgaria" },
  { id: 50, code: "BF", name: "Burkina Faso" },
  { id: 51, code: "BI", name: "Burundi" },

  // C
  { id: 52, code: "KH", name: "Cambodia" },
  { id: 53, code: "CM", name: "Cameroon" },
  { id: 54, code: "CV", name: "Cape Verde" },
  { id: 55, code: "CF", name: "Central African Republic" },
  { id: 56, code: "TD", name: "Chad" },
  { id: 57, code: "CL", name: "Chile" },
  { id: 58, code: "CO", name: "Colombia" },
  { id: 59, code: "KM", name: "Comoros" },
  { id: 60, code: "CG", name: "Congo - Brazzaville" },
  { id: 61, code: "CD", name: "Congo - Kinshasa" },
  { id: 62, code: "CR", name: "Costa Rica" },
  { id: 63, code: "HR", name: "Croatia" },
  { id: 64, code: "CU", name: "Cuba" },
  { id: 65, code: "CY", name: "Cyprus" },
  { id: 66, code: "CZ", name: "Czech Republic" },

  // D
  { id: 67, code: "DK", name: "Denmark" },
  { id: 68, code: "DJ", name: "Djibouti" },
  { id: 69, code: "DM", name: "Dominica" },
  { id: 70, code: "DO", name: "Dominican Republic" },

  // E
  { id: 71, code: "EC", name: "Ecuador" },
  { id: 72, code: "SV", name: "El Salvador" },
  { id: 73, code: "GQ", name: "Equatorial Guinea" },
  { id: 74, code: "ER", name: "Eritrea" },
  { id: 75, code: "EE", name: "Estonia" },
  { id: 76, code: "SZ", name: "Eswatini (Swaziland)" },
  { id: 77, code: "ET", name: "Ethiopia" },

  // F
  { id: 78, code: "FJ", name: "Fiji" },
  { id: 79, code: "FI", name: "Finland" },
  { id: 80, code: "FR", name: "France" },

  // G
  { id: 81, code: "GA", name: "Gabon" },
  { id: 82, code: "GM", name: "Gambia" },
  { id: 83, code: "GE", name: "Georgia" },
  { id: 84, code: "DE", name: "Germany" },
  { id: 85, code: "GH", name: "Ghana" },
  { id: 86, code: "GR", name: "Greece" },
  { id: 87, code: "GD", name: "Grenada" },
  { id: 88, code: "GT", name: "Guatemala" },
  { id: 89, code: "GN", name: "Guinea" },
  { id: 90, code: "GW", name: "Guinea-Bissau" },
  { id: 91, code: "GY", name: "Guyana" },

  // H
  { id: 92, code: "HT", name: "Haiti" },
  { id: 93, code: "HN", name: "Honduras" },
  { id: 94, code: "HU", name: "Hungary" },

  // I
  { id: 95, code: "IS", name: "Iceland" },
  { id: 96, code: "IR", name: "Iran" },
  { id: 97, code: "IQ", name: "Iraq" },
  { id: 98, code: "IE", name: "Ireland" },
  { id: 99, code: "IL", name: "Israel" },
  { id: 100, code: "CI", name: "Ivory Coast (Côte d’Ivoire)" },

  // J
  { id: 101, code: "JM", name: "Jamaica" },
  { id: 102, code: "JO", name: "Jordan" },

  // K
  { id: 103, code: "KZ", name: "Kazakhstan" },
  { id: 104, code: "KE", name: "Kenya" },
  { id: 105, code: "KI", name: "Kiribati" },
  { id: 106, code: "XK", name: "Kosovo" },
  { id: 107, code: "KG", name: "Kyrgyzstan" },

  // L
  { id: 108, code: "LA", name: "Laos" },
  { id: 109, code: "LV", name: "Latvia" },
  { id: 110, code: "LB", name: "Lebanon" },
  { id: 111, code: "LS", name: "Lesotho" },
  { id: 112, code: "LR", name: "Liberia" },
  { id: 113, code: "LY", name: "Libya" },
  { id: 114, code: "LI", name: "Liechtenstein" },
  { id: 115, code: "LT", name: "Lithuania" },
  { id: 116, code: "LU", name: "Luxembourg" },

  // M
  { id: 117, code: "MG", name: "Madagascar" },
  { id: 118, code: "MW", name: "Malawi" },
  { id: 119, code: "MV", name: "Maldives" },
  { id: 120, code: "ML", name: "Mali" },
  { id: 121, code: "MT", name: "Malta" },
  { id: 122, code: "MH", name: "Marshall Islands" },
  { id: 123, code: "MR", name: "Mauritania" },
  { id: 124, code: "MU", name: "Mauritius" },
  { id: 125, code: "MX", name: "Mexico" },
  { id: 126, code: "FM", name: "Micronesia" },
  { id: 127, code: "MD", name: "Moldova" },
  { id: 128, code: "MC", name: "Monaco" },
  { id: 129, code: "MN", name: "Mongolia" },
  { id: 130, code: "ME", name: "Montenegro" },
  { id: 131, code: "MA", name: "Morocco" },
  { id: 132, code: "MZ", name: "Mozambique" },
  { id: 133, code: "MM", name: "Myanmar (Burma)" },

  // N
  { id: 134, code: "NA", name: "Namibia" },
  { id: 135, code: "NR", name: "Nauru" },
  { id: 136, code: "NP", name: "Nepal" },
  { id: 137, code: "NL", name: "Netherlands" },
  { id: 138, code: "NZ", name: "New Zealand" },
  { id: 139, code: "NI", name: "Nicaragua" },
  { id: 140, code: "NE", name: "Niger" },
  { id: 141, code: "NG", name: "Nigeria" },
  { id: 142, code: "MK", name: "North Macedonia" },
  { id: 143, code: "NO", name: "Norway" },

  // P
  { id: 144, code: "PW", name: "Palau" },
  { id: 145, code: "PS", name: "Palestine" },
  { id: 146, code: "PA", name: "Panama" },
  { id: 147, code: "PG", name: "Papua New Guinea" },
  { id: 148, code: "PY", name: "Paraguay" },
  { id: 149, code: "PE", name: "Peru" },
  { id: 150, code: "PL", name: "Poland" },
  { id: 151, code: "PT", name: "Portugal" },

  // R
  { id: 152, code: "RO", name: "Romania" },
  { id: 153, code: "RU", name: "Russia" },
  { id: 154, code: "RW", name: "Rwanda" },

  // S
  { id: 155, code: "KN", name: "Saint Kitts and Nevis" },
  { id: 156, code: "LC", name: "Saint Lucia" },
  { id: 157, code: "VC", name: "Saint Vincent and the Grenadines" },
  { id: 158, code: "WS", name: "Samoa" },
  { id: 159, code: "SM", name: "San Marino" },
  { id: 160, code: "ST", name: "São Tomé and Príncipe" },
  { id: 161, code: "SN", name: "Senegal" },
  { id: 162, code: "RS", name: "Serbia" },
  { id: 163, code: "SC", name: "Seychelles" },
  { id: 164, code: "SL", name: "Sierra Leone" },
  { id: 165, code: "SK", name: "Slovakia" },
  { id: 166, code: "SI", name: "Slovenia" },
  { id: 167, code: "SB", name: "Solomon Islands" },
  { id: 168, code: "SO", name: "Somalia" },
  { id: 169, code: "ZA", name: "South Africa" },
  { id: 170, code: "SS", name: "South Sudan" },
  { id: 171, code: "ES", name: "Spain" },
  { id: 172, code: "LK", name: "Sri Lanka" },
  { id: 173, code: "SD", name: "Sudan" },
  { id: 174, code: "SR", name: "Suriname" },
  { id: 175, code: "SE", name: "Sweden" },
  { id: 176, code: "CH", name: "Switzerland" },
  { id: 177, code: "SY", name: "Syria" },

  // T
  { id: 178, code: "TW", name: "Taiwan" },
  { id: 179, code: "TJ", name: "Tajikistan" },
  { id: 180, code: "TZ", name: "Tanzania" },
  { id: 181, code: "TL", name: "Timor-Leste" },
  { id: 182, code: "TG", name: "Togo" },
  { id: 183, code: "TO", name: "Tonga" },
  { id: 184, code: "TT", name: "Trinidad and Tobago" },
  { id: 185, code: "TN", name: "Tunisia" },
  { id: 186, code: "TM", name: "Turkmenistan" },
  { id: 187, code: "TV", name: "Tuvalu" },

  // U
  { id: 188, code: "UG", name: "Uganda" },
  { id: 189, code: "UA", name: "Ukraine" },
  { id: 190, code: "UY", name: "Uruguay" },
  { id: 191, code: "UZ", name: "Uzbekistan" },

  // V & Y & Z
  { id: 192, code: "VU", name: "Vanuatu" },
  { id: 193, code: "VA", name: "Vatican City" },
  { id: 194, code: "VE", name: "Venezuela" },
  { id: 195, code: "YE", name: "Yemen" },
  { id: 196, code: "ZM", name: "Zambia" },
  { id: 197, code: "ZW", name: "Zimbabwe" },

  // Fallback
  { id: 999, code: "OT", name: "Other" },
]

export const COUNTRY_MAP_BY_ID = new Map<number, CountryOption>(
  COUNTRIES.map((c) => [c.id, c])
)

export const COUNTRY_MAP_BY_NAME = new Map<string, CountryOption>(
  COUNTRIES.flatMap((c) => [
    [c.name.toLowerCase(), c],
    [c.code.toLowerCase(), c],
  ])
)

/**
 * Get country name from numeric ID or fallback string
 */
export function getCountryName(value?: number | string | null): string {
  if (value === undefined || value === null || value === "") return ""
  if (typeof value === "number" || (!isNaN(Number(value)) && !isNaN(parseFloat(String(value))))) {
    const num = Number(value)
    return COUNTRY_MAP_BY_ID.get(num)?.name || String(value)
  }
  const match = COUNTRY_MAP_BY_NAME.get(String(value).toLowerCase())
  return match ? match.name : String(value)
}

/**
 * Get numeric country ID from name or code
 */
export function getCountryId(nameOrCode?: string | null): number {
  if (!nameOrCode) return 999
  const match = COUNTRY_MAP_BY_NAME.get(nameOrCode.trim().toLowerCase())
  return match ? match.id : 999
}

/**
 * Dropdown options for UI select components (all 195+ countries)
 */
export const COUNTRY_DROPDOWN_OPTIONS: string[] = COUNTRIES.map((c) => c.name)

export const COUNTRY_SELECT_OPTIONS = COUNTRIES.map((c) => ({
  label: c.name,
  value: c.name,
}))

