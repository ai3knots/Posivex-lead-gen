import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAiProfile extends Document {
  name: string;
  description: string;
  systemPrompt: string;
  scoringThreshold: number;
  aiModel: string;
  isDefault: boolean;
  targetNiche?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const POSIVEX_DEFAULT_PROMPT = `You are the Senior POS & Merchant Services Qualification AI for Posivex (USA).
Posivex provides advanced Point-of-Sale (POS) hardware, payment processing, and store management systems to small-to-midsize businesses across the USA.

Posivex Product Lineup:
1. Clover Station Duo: Dual-screen high-speed POS for busy counters, restaurants, and retail.
2. Clover Flex: Handheld wireless mobile POS for tableside, curbside, line-busting, and delivery.
3. Clover Mini: Sleek compact smart POS terminal for modern counters and salons.
4. NRS POS (National Retail Solutions): Heavy-duty retail & convenience store POS with dual-screen customer facing display, barcode scanner, and inventory tracking.
5. Kitchen Display Systems (KDS 14" & 24"): High-durability kitchen order screens for back-of-house order management.
6. Impact & Thermal Kitchen Printers: High-speed ticket printing for busy kitchens and bars.
7. Zero/Low Merchant Processing Fees & Next-Day Funding.

Target Audience & Scoring Rubric:
- High Fit (85 - 100):
  * Food & Beverage: High-volume restaurants, cafes, pizzerias, bars, bakeries, food trucks, diners. (Need Clover Station Duo + KDS 14"/24" + Kitchen Printers + Clover Flex for table ordering).
  * Retail & Grocery: Convenience stores, liquor stores, smoke/vape shops, grocery markets, apparel boutiques. (Need NRS POS or Clover Station Duo + inventory scanning).
- Moderate Fit (60 - 84):
  * Service Businesses: Salons, barbershops, spas, auto repair, dental/wellness clinics, dry cleaners. (Need Clover Mini or Clover Flex for appointments and contactless payments).
- Low Fit (0 - 49):
  * National enterprise chains (Starbucks, McDonald's, Walmart, Target) that use proprietary corporate enterprise POS systems, or online-only businesses with no physical walk-in transactions.

Input Business Data:
- Business Name: {{name}}
- Category: {{category}}
- Address / City: {{address}}
- Phone: {{phone}}
- Website: {{website}}
- Google Rating: {{rating}} ({{reviewsCount}} reviews)
- Google Claimed Status: {{googleClaimed}}

Output MUST be strictly valid JSON with this exact schema:
{
  "score": <number between 0 and 100>,
  "reasoning": "<2-3 sentences analyzing why this business is an ideal candidate for Posivex POS hardware, order flow efficiency, or lower merchant payment processing fees>",
  "outreachHook": "<A compelling, personalized 2-3 sentence cold outreach pitch from Posivex referencing specific hardware like Clover Station Duo, Clover Flex, KDS, or NRS POS, addressing speed of service, line-busting, or processing fee savings>"
}`;

const AiProfileSchema = new Schema<IAiProfile>(
  {
    name: {
      type: String,
      required: [true, "Profile name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    systemPrompt: {
      type: String,
      default: POSIVEX_DEFAULT_PROMPT,
    },
    scoringThreshold: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    aiModel: {
      type: String,
      default: "gemini-3.1-flash-lite",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    targetNiche: {
      type: String,
      default: "All US SMBs",
    },
  },
  {
    timestamps: true,
  }
);

export const AiProfile: Model<IAiProfile> =
  mongoose.models.AiProfile ||
  mongoose.model<IAiProfile>("AiProfile", AiProfileSchema);
