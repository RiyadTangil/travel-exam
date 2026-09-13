/**
 * Centralized CRM Constants and Enums
 *
 * For DB storage optimization, options are saved as NUMERIC values in Mongoose/MongoDB.
 * Frontend UI and API responses serialize/deserialize between numeric DB values and clean string representations.
 */

// Numeric Enums
export enum CrmServiceEnum {
  AIR_TICKET = 1,
  VISA = 2,
  UMRAH = 3,
  HOLIDAY_PACKAGE = 4,
  HOTEL = 5,
  CUSTOM_TOUR = 6,
  TRANSPORT = 7,
  OTHERS = 8,
}

export enum CrmStageEnum {
  NEW = 1,
  QUALIFIED = 2,
  QUOTED = 3,
  FOLLOWUP = 4,
  WON = 5,
  LOST = 6,
}

export enum CrmPriorityEnum {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

export enum CrmSourceEnum {
  WALK_IN = 1,
  WHATSAPP = 2,
  FACEBOOK = 3,
  PHONE_CALL = 4,
  REFERRAL = 5,
  WEBSITE = 6,
  B2B_AGENT = 7,
}

export enum CrmTaskCategoryEnum {
  WALK_IN_FOLLOWUP = 1,
  VISA_EXPIRY = 2,
  PASSPORT_EXPIRY = 3,
  PRE_DEPARTURE = 4,
  GENERAL_CALL = 5,
}

// String Type definitions for frontend compatibility
export type ServiceTypeString =
  | "AIR_TICKET"
  | "VISA"
  | "UMRAH"
  | "HOLIDAY_PACKAGE"
  | "HOTEL"
  | "CUSTOM_TOUR"
  | "TRANSPORT"
  | "OTHERS"

export type StageString = "NEW" | "QUALIFIED" | "QUOTED" | "FOLLOWUP" | "WON" | "LOST"
export type PriorityString = "HIGH" | "MEDIUM" | "LOW"
export type SourceString =
  | "WALK_IN"
  | "WHATSAPP"
  | "FACEBOOK"
  | "PHONE_CALL"
  | "REFERRAL"
  | "WEBSITE"
  | "B2B_AGENT"

export type TaskCategoryString =
  | "WALK_IN_FOLLOWUP"
  | "VISA_EXPIRY"
  | "PASSPORT_EXPIRY"
  | "PRE_DEPARTURE"
  | "GENERAL_CALL"

// Bidirectional Mappings: Service Type
export const SERVICE_MAP: Record<ServiceTypeString, number> = {
  AIR_TICKET: CrmServiceEnum.AIR_TICKET,
  VISA: CrmServiceEnum.VISA,
  UMRAH: CrmServiceEnum.UMRAH,
  HOLIDAY_PACKAGE: CrmServiceEnum.HOLIDAY_PACKAGE,
  HOTEL: CrmServiceEnum.HOTEL,
  CUSTOM_TOUR: CrmServiceEnum.CUSTOM_TOUR,
  TRANSPORT: CrmServiceEnum.TRANSPORT,
  OTHERS: CrmServiceEnum.OTHERS,
}

export const REVERSE_SERVICE_MAP: Record<number, ServiceTypeString> = {
  [CrmServiceEnum.AIR_TICKET]: "AIR_TICKET",
  [CrmServiceEnum.VISA]: "VISA",
  [CrmServiceEnum.UMRAH]: "UMRAH",
  [CrmServiceEnum.HOLIDAY_PACKAGE]: "HOLIDAY_PACKAGE",
  [CrmServiceEnum.HOTEL]: "HOTEL",
  [CrmServiceEnum.CUSTOM_TOUR]: "CUSTOM_TOUR",
  [CrmServiceEnum.TRANSPORT]: "TRANSPORT",
  [CrmServiceEnum.OTHERS]: "OTHERS",
}

// Bidirectional Mappings: Stage
export const STAGE_MAP: Record<StageString, number> = {
  NEW: CrmStageEnum.NEW,
  QUALIFIED: CrmStageEnum.QUALIFIED,
  QUOTED: CrmStageEnum.QUOTED,
  FOLLOWUP: CrmStageEnum.FOLLOWUP,
  WON: CrmStageEnum.WON,
  LOST: CrmStageEnum.LOST,
}

export const REVERSE_STAGE_MAP: Record<number, StageString> = {
  [CrmStageEnum.NEW]: "NEW",
  [CrmStageEnum.QUALIFIED]: "QUALIFIED",
  [CrmStageEnum.QUOTED]: "QUOTED",
  [CrmStageEnum.FOLLOWUP]: "FOLLOWUP",
  [CrmStageEnum.WON]: "WON",
  [CrmStageEnum.LOST]: "LOST",
}

// Bidirectional Mappings: Priority
export const PRIORITY_MAP: Record<PriorityString, number> = {
  HIGH: CrmPriorityEnum.HIGH,
  MEDIUM: CrmPriorityEnum.MEDIUM,
  LOW: CrmPriorityEnum.LOW,
}

export const REVERSE_PRIORITY_MAP: Record<number, PriorityString> = {
  [CrmPriorityEnum.HIGH]: "HIGH",
  [CrmPriorityEnum.MEDIUM]: "MEDIUM",
  [CrmPriorityEnum.LOW]: "LOW",
}

// Bidirectional Mappings: Source
export const SOURCE_MAP: Record<SourceString, number> = {
  WALK_IN: CrmSourceEnum.WALK_IN,
  WHATSAPP: CrmSourceEnum.WHATSAPP,
  FACEBOOK: CrmSourceEnum.FACEBOOK,
  PHONE_CALL: CrmSourceEnum.PHONE_CALL,
  REFERRAL: CrmSourceEnum.REFERRAL,
  WEBSITE: CrmSourceEnum.WEBSITE,
  B2B_AGENT: CrmSourceEnum.B2B_AGENT,
}

export const REVERSE_SOURCE_MAP: Record<number, SourceString> = {
  [CrmSourceEnum.WALK_IN]: "WALK_IN",
  [CrmSourceEnum.WHATSAPP]: "WHATSAPP",
  [CrmSourceEnum.FACEBOOK]: "FACEBOOK",
  [CrmSourceEnum.PHONE_CALL]: "PHONE_CALL",
  [CrmSourceEnum.REFERRAL]: "REFERRAL",
  [CrmSourceEnum.WEBSITE]: "WEBSITE",
  [CrmSourceEnum.B2B_AGENT]: "B2B_AGENT",
}

// Bidirectional Mappings: Task Category
export const TASK_CATEGORY_MAP: Record<TaskCategoryString, number> = {
  WALK_IN_FOLLOWUP: CrmTaskCategoryEnum.WALK_IN_FOLLOWUP,
  VISA_EXPIRY: CrmTaskCategoryEnum.VISA_EXPIRY,
  PASSPORT_EXPIRY: CrmTaskCategoryEnum.PASSPORT_EXPIRY,
  PRE_DEPARTURE: CrmTaskCategoryEnum.PRE_DEPARTURE,
  GENERAL_CALL: CrmTaskCategoryEnum.GENERAL_CALL,
}

export const REVERSE_TASK_CATEGORY_MAP: Record<number, TaskCategoryString> = {
  [CrmTaskCategoryEnum.WALK_IN_FOLLOWUP]: "WALK_IN_FOLLOWUP",
  [CrmTaskCategoryEnum.VISA_EXPIRY]: "VISA_EXPIRY",
  [CrmTaskCategoryEnum.PASSPORT_EXPIRY]: "PASSPORT_EXPIRY",
  [CrmTaskCategoryEnum.PRE_DEPARTURE]: "PRE_DEPARTURE",
  [CrmTaskCategoryEnum.GENERAL_CALL]: "GENERAL_CALL",
}

// UI Option Definitions
export const SERVICE_TYPE_OPTIONS: Array<{ value: ServiceTypeString; label: string; icon: string }> = [
  { value: "AIR_TICKET", label: "Air Ticket", icon: "✈️" },
  { value: "VISA", label: "Visa Processing", icon: "📄" },
  { value: "UMRAH", label: "Umrah Package", icon: "🕋" },
  { value: "HOLIDAY_PACKAGE", label: "Holiday Package", icon: "🏝️" },
  { value: "HOTEL", label: "Hotel Booking", icon: "🏨" },
  { value: "CUSTOM_TOUR", label: "Custom Tour", icon: "🗺️" },
  { value: "TRANSPORT", label: "Transport Service", icon: "🚌" },
  { value: "OTHERS", label: "Others", icon: "✨" },
]

export const STAGE_OPTIONS: Array<{ value: StageString; label: string; color: string }> = [
  { value: "NEW", label: "New Lead", color: "blue" },
  { value: "QUALIFIED", label: "Qualified", color: "cyan" },
  { value: "QUOTED", label: "Quotation Sent", color: "orange" },
  { value: "FOLLOWUP", label: "Follow-up Pending", color: "purple" },
  { value: "WON", label: "Won / Booked", color: "green" },
  { value: "LOST", label: "Lost / Closed", color: "red" },
]

export const SOURCE_OPTIONS: Array<{ value: SourceString; label: string }> = [
  { value: "WALK_IN", label: "🚶 Walk-in Visitor" },
  { value: "WHATSAPP", label: "💬 WhatsApp Enquiry" },
  { value: "FACEBOOK", label: "📘 Social Media (FB/IG)" },
  { value: "PHONE_CALL", label: "📞 Phone Call" },
  { value: "REFERRAL", label: "🤝 Client Referral" },
  { value: "WEBSITE", label: "🌐 Website Form" },
  { value: "B2B_AGENT", label: "🏢 Sub-Agent / B2B" },
]
