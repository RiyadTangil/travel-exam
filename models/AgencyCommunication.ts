import mongoose, { Schema, Document, Types } from "mongoose";
import { IMarketingCampaign } from "./MarketingCampaign";

export interface IAgencyCommunication extends Document {
  agency_id: number; // Matches GovtRegAgency.id
  type: 'manual_note' | 'campaign';
  campaign_id?: Types.ObjectId | IMarketingCampaign;
  note?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgencyCommunicationSchema = new Schema<IAgencyCommunication>({
  agency_id: { type: Number, required: true, index: true },
  type: { type: String, enum: ['manual_note', 'campaign'], required: true },
  campaign_id: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign' },
  note: { type: String },
  status: { type: String },
}, { 
  timestamps: true,
  versionKey: false,
});

const AgencyCommunication = mongoose.models.AgencyCommunication || mongoose.model<IAgencyCommunication>('AgencyCommunication', AgencyCommunicationSchema);
export default AgencyCommunication;
