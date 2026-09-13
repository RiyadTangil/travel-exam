import { Schema, model, models, Types, Model } from "mongoose"
import { baseSchemaOptions } from "@/lib/base-schema"

export interface ITemplateTypeOverride {
  invoiceType: "other" | "visa" | "non_commission" | "air_ticket" | "umrah" | "refund"
  templateId: string // registry key e.g. "classic" | "airline"
}

export interface IInvoiceTemplateConfig {
  companyId: Types.ObjectId
  defaultTemplateId: string      // company-wide fallback template
  overrides: ITemplateTypeOverride[] // per-invoiceType overrides
  showWatermark: boolean
  showSignatures: boolean
  showServiceCharge: boolean      // show Service Charge row in summary
  showVat: boolean                // show VAT / Tax row in summary
  showPayment: boolean            // show Payment row in summary
  showDue: boolean                // show Due row in summary
  showFlightDetails: number       // 0 = hide, 1 = show (default 0)
  signatureUrl?: string           // digital signature / seal image
  signatureTitle?: string         // custom title, e.g. "Authority Signature"
  customHeader?: string           // optional extra header text
  customFooter?: string           // optional footer note
  createdBy: Types.ObjectId
  updatedBy: Types.ObjectId
}

const TemplateTypeOverrideSchema = new Schema<ITemplateTypeOverride>(
  {
    invoiceType: {
      type: String,
      enum: ["other", "visa", "non_commission", "air_ticket", "umrah", "refund"],
      required: true,
    },
    templateId: { type: String, required: true },
  },
  { _id: false }
)

const InvoiceTemplateConfigSchema = new Schema<IInvoiceTemplateConfig>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, unique: true, index: true },
    defaultTemplateId: { type: String, default: "airline" },
    overrides: { type: [TemplateTypeOverrideSchema], default: [] },
    showWatermark: { type: Boolean, default: true },
    showSignatures: { type: Boolean, default: true },
    showServiceCharge: { type: Boolean, default: true },
    showVat: { type: Boolean, default: true },
    showPayment: { type: Boolean, default: true },
    showDue: { type: Boolean, default: true },
    showFlightDetails: { type: Number, default: 0 },
    signatureUrl: { type: String },
    signatureTitle: { type: String, default: "Authority Signature" },
    customHeader: { type: String },
    customFooter: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    ...baseSchemaOptions,
    collection: "invoice_template_configs",
  } as any
)

export const InvoiceTemplateConfig: Model<IInvoiceTemplateConfig> =
  (models.InvoiceTemplateConfig as Model<IInvoiceTemplateConfig>) ||
  model<IInvoiceTemplateConfig>("InvoiceTemplateConfig", InvoiceTemplateConfigSchema)

export default InvoiceTemplateConfig
