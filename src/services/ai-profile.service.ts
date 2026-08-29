import { connectToDatabase } from "@/lib/db";
import { AiProfile, IAiProfile, POSIVEX_DEFAULT_PROMPT } from "@/models/AiProfile";

export interface CreateAiProfileDTO {
  name: string;
  description?: string;
  systemPrompt?: string;
  scoringThreshold?: number;
  aiModel?: string;
  targetNiche?: string;
  isDefault?: boolean;
}

/**
 * Pre-configured Posivex POS profiles for specific business verticals.
 */
export const POSIVEX_PRESET_PROFILES = [
  {
    name: "Default POS & Merchant Fit",
    description: "General evaluation for US restaurants, retail, and service businesses for Clover, NRS POS, and lower processing fees.",
    systemPrompt: POSIVEX_DEFAULT_PROMPT,
    scoringThreshold: 50,
    aiModel: "gemini-3.1-flash-lite",
    isDefault: true,
    targetNiche: "All Retail & Restaurants",
  },
  {
    name: "Restaurants & Bars (Clover + KDS)",
    description: "Targets restaurants, cafes, pizzerias, and bars needing Clover Station Duo, Clover Flex handhelds, Kitchen Display Systems (KDS 14\"/24\"), and Kitchen Printers.",
    systemPrompt: `You are a Restaurant Technology Specialist for Posivex (USA).
Posivex equips restaurants, pizzerias, cafes, diners, and bars or similar buessines with:
- Clover Station Duo (Dual-screen countertop POS for lightning-fast register flow)
- Clover Flex (Wireless handheld POS for tableside ordering and curbside payments)
- KDS 14" & 24" (Digital Kitchen Display Systems replacing messy paper tickets)
- Kitchen Impact Printers (Heavy-duty order printers for kitchen & bar)
- Zero-cost payment processing options & next-day funding.

Evaluate if this food & beverage establishment has high transaction volume, busy dining hours, or delivery bottlenecks.

Business Data:
- Name: {{name}}
- Category: {{category}}
- Address: {{address}}
- Rating: {{rating}} ({{reviewsCount}} reviews)
- Phone: {{phone}}
- Website: {{website}}

Output MUST be strictly valid JSON:
{
  "score": <0-100>,
  "reasoning": "<2 sentences detailing why their kitchen order flow or front-counter checkout would benefit from Posivex Clover Station Duo or KDS>",
  "outreachHook": "<A 2-3 sentence personalized pitch from Posivex offering Clover Flex for tableside speed or KDS 14\"/24\" screens to streamline their busy kitchen>"
}`,
    scoringThreshold: 60,
    aiModel: "gemini-3.1-flash-lite",
    isDefault: false,
    targetNiche: "Food & Beverage",
  },
  {
    name: "Retail & Convenience (NRS POS)",
    description: "Targets convenience stores, grocery stores, smoke shops, liquor stores, and retail boutiques needing NRS POS with barcode scanners and inventory management.",
    systemPrompt: `You are a Retail Solutions Advisor for Posivex (USA).
Posivex supplies convenience stores, bodegas, grocery markets, smoke/vape shops, and retail stores with:
- NRS POS (National Retail Solutions with customer-facing display, barcode scanner, and cash drawer)
- Automated inventory management, price book control, and age-verification prompts
- Ultra-low transaction fees and Cash Discount / Dual Pricing programs to wipe out processing costs.

Evaluate if this retail business handles high item counts, inventory turnover, or cash/card transactions.

Business Data:
- Name: {{name}}
- Category: {{category}}
- Address: {{address}}
- Rating: {{rating}}
- Phone: {{phone}}

Output MUST be strictly valid JSON:
{
  "score": <0-100>,
  "reasoning": "<2 sentences explaining why NRS POS and automated inventory control will cut their operational costs>",
  "outreachHook": "<A 2-3 sentence pitch highlighting Posivex NRS POS dual-screen registers, barcode inventory tracking, and slashing monthly merchant fees>"
}`,
    scoringThreshold: 50,
    aiModel: "gemini-3.1-flash-lite",
    isDefault: false,
    targetNiche: "Retail & Convenience",
  },
  {
    name: "Service & Salons (Clover Mini / Flex)",
    description: "Targets salons, spas, automotive repair, medical clinics, and contractors needing sleek compact terminals (Clover Mini / Clover Flex).",
    systemPrompt: `You are a Merchant Services Consultant for Posivex (USA).
Posivex supplies salons, barbershops, auto service shops, dental/wellness clinics, and professional services with:
- Clover Mini (Sleek countertop smart terminal with customer tip prompt and signature capture)
- Clover Flex (Wireless all-in-one terminal for anywhere payments)
- Transparent low-rate merchant processing with zero hidden fees.

Evaluate if this service business requires modern payment acceptance and lower processing overhead.

Business Data:
- Name: {{name}}
- Category: {{category}}
- Address: {{address}}
- Rating: {{rating}}
- Phone: {{phone}}

Output MUST be strictly valid JSON:
{
  "score": <0-100>,
  "reasoning": "<2 sentences on how Clover Mini/Flex enhances their client checkout and saves on credit card fees>",
  "outreachHook": "<A 2-3 sentence pitch proposing a modern Clover Mini terminal upgrade with transparent merchant processing rates>"
}`,
    scoringThreshold: 50,
    aiModel: "gemini-3.1-flash-lite",
    isDefault: false,
    targetNiche: "Service Businesses",
  }
];

/**
 * Initializes or resets default Posivex AI Profiles in MongoDB.
 */
export async function ensureDefaultAiProfiles(forceReset: boolean = false) {
  await connectToDatabase();
  const count = await AiProfile.countDocuments();
  if (count === 0 || forceReset) {
    if (forceReset) {
      await AiProfile.deleteMany({});
    }
    await AiProfile.create(POSIVEX_PRESET_PROFILES);
  }
}

/**
 * Lists all AI evaluation profiles.
 */
export async function listAiProfiles(): Promise<IAiProfile[]> {
  await connectToDatabase();
  await ensureDefaultAiProfiles();
  return AiProfile.find({}).sort({ isDefault: -1, createdAt: -1 }).lean() as unknown as Promise<IAiProfile[]>;
}

/**
 * Retrieves a single AI Profile by ID or Name.
 */
export async function getAiProfile(idOrName?: string): Promise<IAiProfile | null> {
  await connectToDatabase();
  await ensureDefaultAiProfiles();

  if (!idOrName) {
    const def = await AiProfile.findOne({ isDefault: true }).lean();
    return def as unknown as IAiProfile | null;
  }

  const isObjectId = typeof idOrName === "string" && /^[0-9a-fA-F]{24}$/.test(idOrName);
  let profile = await AiProfile.findOne({
    $or: [
      ...(isObjectId ? [{ _id: idOrName }] : []),
      { name: idOrName },
    ],
  }).lean();

  if (!profile) {
    profile = await AiProfile.findOne({ isDefault: true }).lean();
  }

  return profile as unknown as IAiProfile | null;
}

/**
 * Creates a new custom AI Profile with evaluation criteria.
 */
export async function createAiProfile(data: CreateAiProfileDTO): Promise<IAiProfile> {
  await connectToDatabase();
  const profile = new AiProfile({
    name: data.name,
    description: data.description || "",
    systemPrompt: data.systemPrompt || POSIVEX_DEFAULT_PROMPT,
    scoringThreshold: data.scoringThreshold || 50,
    aiModel: data.aiModel || "gemini-3.1-flash-lite",
    targetNiche: data.targetNiche || "General",
    isDefault: data.isDefault || false,
  });

  await profile.save();
  return profile;
}

/**
 * Updates an AI Profile's prompt or scoring criteria.
 */
export async function updateAiProfile(id: string, updates: Partial<IAiProfile>): Promise<IAiProfile | null> {
  await connectToDatabase();
  return AiProfile.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

/**
 * Deletes an AI Profile (preventing deletion of the default profile).
 */
export async function deleteAiProfile(id: string): Promise<boolean> {
  await connectToDatabase();
  const profile = await AiProfile.findById(id);
  if (!profile || profile.isDefault) return false;
  await AiProfile.findByIdAndDelete(id);
  return true;
}
