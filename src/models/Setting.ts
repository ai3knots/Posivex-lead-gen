import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  systemPrompt: string;
  scoringThreshold: number;
  aiModel: string;
  adminEmail?: string;
  updatedAt: Date;
}

const DEFAULT_PROMPT = `You are an elite B2B Lead Qualification & Outreach AI for Posivex.
Analyze the following business information and evaluate if it is a strong opportunity for digital marketing, web optimization, SEO, ads, or outsourcing services.

Target Profile & Rubric:
- High fit (80-100): Businesses with missing/outdated websites, lack of ads, good reviews but low online visibility, or busy service industries (cafes, clinics, contractors, showrooms).
- Moderate fit (50-79): Average presence with room for digital growth.
- Low fit (0-49): Enterprise brands or fully optimized corporations.

Input Business Data:
- Business Name: {{name}}
- Category: {{category}}
- Address: {{address}}
- Phone: {{phone}}
- Website: {{website}}
- Rating: {{rating}} ({{reviewsCount}} reviews)
- Google Claimed Status: {{googleClaimed}}

Output MUST be strictly valid JSON with this exact schema:
{
  "score": <number between 0 and 100>,
  "reasoning": "<concise 2-3 sentences explaining why this business needs digital services and where they are lacking>",
  "outreachHook": "<a compelling, professional 2-3 sentence personalized pitch hook referencing specific details about their business>"
}`;

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "app_config",
    },
    systemPrompt: {
      type: String,
      default: DEFAULT_PROMPT,
    },
    scoringThreshold: {
      type: Number,
      default: 50,
    },
    aiModel: {
      type: String,
      default: "gemini-1.5-flash",
    },
    adminEmail: {
      type: String,
      default: "admin@posivex.com",
    },
  },
  {
    timestamps: true,
  }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting ||
  mongoose.model<ISetting>("Setting", SettingSchema);

export { DEFAULT_PROMPT };
