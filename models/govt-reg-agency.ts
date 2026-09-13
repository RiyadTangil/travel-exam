import mongoose, { Schema, Document } from "mongoose";

export interface IAgency extends Document {
  id: number;
  agency_name_license: string;
  business_address_en?: string;
  license_expired_date?: string;
  facebook_page?: string;
  website?: string;
  trabillExp?: Date;
  is_new?: number;
  emails?: { address: string; isDefault: number }[];
  phones?: { number: string; isDefault: number }[];
}

const AgencySchema = new Schema<IAgency>({
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

const GovtRegAgency = mongoose.models.GovtRegAgency || mongoose.model<IAgency>('GovtRegAgency', AgencySchema, 'govt-reg-agency');
export default GovtRegAgency;
