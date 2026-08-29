import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  campaignNumber: number;
  title: string;
  query: string;
  platform: "Google Maps";
  location: string;
  country: string;
  limit: number;
  scrapedCount: number;
  aiEvaluatedCount: number;
  qualifiedCount: number;
  pendingCount: number;
  estimatedCost: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  aiProfile: string;
  apifyRunId?: string;
  datasetId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    campaignNumber: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
    },
    query: {
      type: String,
      required: [true, "Search query is required"],
      trim: true,
    },
    platform: {
      type: String,
      enum: ["Google Maps"],
      default: "Google Maps",
    },
    location: {
      type: String,
      default: "USA",
      trim: true,
    },
    country: {
      type: String,
      default: "us",
      lowercase: true,
      trim: true,
    },
    limit: {
      type: Number,
      default: 50,
      min: 1,
      max: 5000,
    },
    scrapedCount: {
      type: Number,
      default: 0,
    },
    aiEvaluatedCount: {
      type: Number,
      default: 0,
    },
    qualifiedCount: {
      type: Number,
      default: 0,
    },
    pendingCount: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    aiProfile: {
      type: String,
      default: "Default Profile",
    },
    apifyRunId: {
      type: String,
    },
    datasetId: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign sequential campaign number if not specified
CampaignSchema.pre("save", async function (next) {
  if (this.isNew && !this.campaignNumber) {
    const lastCampaign = await (this.constructor as Model<ICampaign>)
      .findOne({})
      .sort({ campaignNumber: -1 })
      .exec();
    this.campaignNumber = lastCampaign ? lastCampaign.campaignNumber + 1 : 1;
  }
  next();
});

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);
