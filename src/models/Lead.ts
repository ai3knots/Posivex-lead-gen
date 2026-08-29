import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILead extends Document {
  campaignId: mongoose.Types.ObjectId;
  campaignNumber: number;
  campaignTitle: string;
  platform: "Google Maps";
  name: string;
  title: string;
  category: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  domain?: string;
  rating?: number;
  reviewsCount?: number;
  openingHours?: string;
  googleClaimed?: string;
  googleMapsUrl?: string;
  placeId?: string;
  googleAdsStatus: "Running Ads" | "Not Running Ads" | "Unknown";
  aiScore: number;
  aiReasoning?: string;
  outreachHook?: string;
  aiProfile: string;
  enriched: boolean;
  status: "new" | "qualified" | "contacted" | "disqualified";
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    campaignNumber: {
      type: Number,
      default: 1,
    },
    campaignTitle: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      enum: ["Google Maps"],
      default: "Google Maps",
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "US",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    domain: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    openingHours: {
      type: String,
      default: "",
    },
    googleClaimed: {
      type: String,
      default: "N/A",
    },
    googleMapsUrl: {
      type: String,
      default: "",
    },
    placeId: {
      type: String,
      index: true,
    },
    googleAdsStatus: {
      type: String,
      enum: ["Running Ads", "Not Running Ads", "Unknown"],
      default: "Not Running Ads",
    },
    aiScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    aiReasoning: {
      type: String,
      default: "",
    },
    outreachHook: {
      type: String,
      default: "",
    },
    aiProfile: {
      type: String,
      default: "Default Profile",
    },
    enriched: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["new", "qualified", "contacted", "disqualified"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast filtering
LeadSchema.index({ campaignId: 1, aiScore: -1 });
LeadSchema.index({ aiScore: -1, platform: 1 });

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
