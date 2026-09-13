import mongoose, { Schema, Document, Types } from "mongoose";
import { IMarketingCampaign } from "./MarketingCampaign";

export interface ICompanyCommunication extends Document {
  company_id: Types.ObjectId; // Reference to Company
  type: 'manual_note' | 'campaign';
  campaign_id?: Types.ObjectId | IMarketingCampaign;
  note?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyCommunicationSchema = new Schema<ICompanyCommunication>({
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  type: { type: String, enum: ['manual_note', 'campaign'], required: true },
  campaign_id: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign' },
  note: { type: String },
  status: { type: String },
}, { 
  timestamps: true,
  versionKey: false,
});

const CompanyCommunication = mongoose.models.CompanyCommunication || mongoose.model<ICompanyCommunication>('CompanyCommunication', CompanyCommunicationSchema);
export default CompanyCommunication;
