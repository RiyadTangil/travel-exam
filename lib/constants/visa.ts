/**
 * Centralized Visa Processing Constants and Numeric Enums
 *
 * For DB optimization per AGENTS.md guidelines, status and mode fields are stored as NUMERIC values.
 * Frontend UI converts these numeric enums to human-readable strings.
 */

export enum VisaProcessingStatusEnum {
  PENDING = 0,
  FILE_SUBMIT = 1,
  MEDICAL = 2,
  POLICE_CLEARANCE = 3,
  TAKAMUL = 4,
  MOFA = 5,
  FINGERPRINT = 6,
  VISA_STAMPING = 7,
  BMET_REGISTRATION = 8,
  PDO_FILE = 9,
  MAN_POWER = 10,
  COMPLETED = 11,
  CANCELLED = 12,
}

export enum VisaProcessingModeEnum {
  SINGLE_ENTRY = 1, // Traditional single entry (unit price, cost price, vendor per item)
  MULTI_STEP = 2,   // Step-by-step processing tracker (costs managed in step tracker)
}

export const VISA_STATUS_LABELS: Record<VisaProcessingStatusEnum, string> = {
  [VisaProcessingStatusEnum.PENDING]: "Pending",
  [VisaProcessingStatusEnum.FILE_SUBMIT]: "File Submit",
  [VisaProcessingStatusEnum.MEDICAL]: "Medical",
  [VisaProcessingStatusEnum.POLICE_CLEARANCE]: "Police Clearance",
  [VisaProcessingStatusEnum.TAKAMUL]: "Takamul",
  [VisaProcessingStatusEnum.MOFA]: "MOFA",
  [VisaProcessingStatusEnum.FINGERPRINT]: "Fingerprint",
  [VisaProcessingStatusEnum.VISA_STAMPING]: "Visa Stamping",
  [VisaProcessingStatusEnum.BMET_REGISTRATION]: "BMET Registration",
  [VisaProcessingStatusEnum.PDO_FILE]: "PDO File",
  [VisaProcessingStatusEnum.MAN_POWER]: "Man Power",
  [VisaProcessingStatusEnum.COMPLETED]: "Completed",
  [VisaProcessingStatusEnum.CANCELLED]: "Cancelled",
}

export const VISA_STATUS_ENUM_BY_LABEL: Record<string, VisaProcessingStatusEnum> = {
  "Pending": VisaProcessingStatusEnum.PENDING,
  "File Submit": VisaProcessingStatusEnum.FILE_SUBMIT,
  "Medical": VisaProcessingStatusEnum.MEDICAL,
  "Police Clearance": VisaProcessingStatusEnum.POLICE_CLEARANCE,
  "Takamul": VisaProcessingStatusEnum.TAKAMUL,
  "MOFA": VisaProcessingStatusEnum.MOFA,
  "Fingerprint": VisaProcessingStatusEnum.FINGERPRINT,
  "Visa Stamping": VisaProcessingStatusEnum.VISA_STAMPING,
  "BMET Registration": VisaProcessingStatusEnum.BMET_REGISTRATION,
  "PDO File": VisaProcessingStatusEnum.PDO_FILE,
  "Man Power": VisaProcessingStatusEnum.MAN_POWER,
  "Completed": VisaProcessingStatusEnum.COMPLETED,
  "Cancelled": VisaProcessingStatusEnum.CANCELLED,
}

/**
 * Get human-readable label for numeric visa status enum
 */
export function getVisaStatusLabel(status?: number | string | null): string {
  if (status === undefined || status === null || status === "") return "Pending"
  if (typeof status === "number" || !isNaN(Number(status))) {
    const num = Number(status)
    return VISA_STATUS_LABELS[num as VisaProcessingStatusEnum] || "Pending"
  }
  return String(status)
}

/**
 * Get numeric enum code from string label
 */
export function getVisaStatusCode(label?: string | null): VisaProcessingStatusEnum {
  if (!label) return VisaProcessingStatusEnum.PENDING
  return VISA_STATUS_ENUM_BY_LABEL[label] ?? VisaProcessingStatusEnum.PENDING
}
