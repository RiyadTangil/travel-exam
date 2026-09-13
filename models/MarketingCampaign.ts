import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMarketingCampaign extends Document {
  type: 'email' | 'whatsapp';
  subject?: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>({
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  subject: { type: String }, // optional for whatsapp
  body: { type: String, required: true },
}, { 
  timestamps: true,
  versionKey: false,
});

const MarketingCampaign = mongoose.models.MarketingCampaign || mongoose.model<IMarketingCampaign>('MarketingCampaign', MarketingCampaignSchema);
export default MarketingCampaign;
