import { connectToDatabase } from "@/lib/db";
import { Campaign, ICampaign } from "@/models/Campaign";
import { Lead } from "@/models/Lead";
import {
  startScraperRun,
  checkRunStatus,
  getDatasetItems,
  mapItemToLead,
} from "./apify.service";
import { evaluateLeadWithGemini } from "./gemini.service";

export interface CreateCampaignDTO {
  title: string;
  query: string;
  location?: string;
  country?: string;
  limit?: number;
  platform?: "Google Maps";
  aiProfile?: string;
}

/**
 * Creates a new campaign record in MongoDB.
 */
export async function createCampaign(data: CreateCampaignDTO): Promise<ICampaign> {
  await connectToDatabase();

  const campaign = new Campaign({
    title: data.title,
    query: data.query,
    location: data.location || "USA",
    country: data.country || "us",
    limit: data.limit || 50,
    platform: data.platform || "Google Maps",
    aiProfile: data.aiProfile || "Default Profile",
    status: "PENDING",
    scrapedCount: 0,
    aiEvaluatedCount: 0,
    qualifiedCount: 0,
    pendingCount: data.limit || 50,
    estimatedCost: 0.0,
  });

  await campaign.save();
  return campaign;
}

/**
 * Lists campaigns with optional platform filtering.
 */
export async function listCampaigns(platform?: string): Promise<ICampaign[]> {
  await connectToDatabase();

  const query: Record<string, any> = {};
  if (platform && platform !== "ALL SOURCES" && platform !== "all") {
    query.platform = platform;
  }

  return Campaign.find(query).sort({ createdAt: -1 }).lean() as unknown as Promise<ICampaign[]>;
}

/**
 * Retrieves a single campaign by ID.
 */
export async function getCampaignById(id: string): Promise<ICampaign | null> {
  await connectToDatabase();
  return Campaign.findById(id).lean() as unknown as Promise<ICampaign | null>;
}

/**
 * Retrieves the most recent campaign for the dashboard highlight card.
 */
export async function getLatestCampaign(): Promise<ICampaign | null> {
  await connectToDatabase();
  return Campaign.findOne({}).sort({ createdAt: -1 }).lean() as unknown as Promise<ICampaign | null>;
}

/**
 * Updates campaign status and operational counters.
 */
export async function updateCampaignStatus(
  id: string,
  update: Partial<ICampaign>
): Promise<ICampaign | null> {
  await connectToDatabase();
  return Campaign.findByIdAndUpdate(id, { $set: update }, { new: true });
}

/**
 * Deletes a campaign along with all its scraped leads.
 */
export async function deleteCampaign(id: string): Promise<boolean> {
  await connectToDatabase();
  await Lead.deleteMany({ campaignId: id });
  const res = await Campaign.findByIdAndDelete(id);
  return !!res;
}

/**
 * Direct execution pipeline for Google Maps scraping and Gemini qualification.
 * Executes in the background and updates MongoDB campaign & lead documents.
 */
export async function executeCampaignScrape(campaignId: string) {
  try {
    await connectToDatabase();
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      console.error(`Campaign ${campaignId} not found for scraping.`);
      return;
    }

    // 1. Mark status as RUNNING
    campaign.status = "RUNNING";
    await campaign.save();

    // 2. Start Apify Google Maps Scraper run
    console.log(`Starting Apify scrape for campaign: ${campaign.title} (${campaign.query})...`);
    const apifyRun = await startScraperRun(
      campaign.query,
      campaign.location,
      campaign.limit,
      campaign.country
    );

    let isFinished = false;
    let datasetId = apifyRun.datasetId;

    // 3. Poll Apify until complete
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      const status = await checkRunStatus(apifyRun.runId);

      if (status?.status === "SUCCEEDED") {
        isFinished = true;
        if (status.defaultDatasetId) datasetId = status.defaultDatasetId;
        break;
      }

      if (status?.status === "FAILED" || status?.status === "ABORTED") {
        throw new Error(`Apify scrape failed with status: ${status?.status}`);
      }
    }

    if (!datasetId) {
      throw new Error("No dataset ID returned by Apify");
    }

    // 4. Fetch raw dataset items from Apify
    const items = await getDatasetItems(datasetId);
    console.log(`Fetched ${items.length} items from Apify for campaign ${campaign.title}`);

    // Load selected AI Profile prompt and model
    const { getAiProfile } = await import("./ai-profile.service");
    const aiProfileDoc = await getAiProfile(campaign.aiProfile || "Default Profile");
    const customPrompt = aiProfileDoc?.systemPrompt;
    const aiModel = aiProfileDoc?.aiModel || "gemini-3.1-flash-lite";
    const threshold = aiProfileDoc?.scoringThreshold ?? 50;

    let qualifiedCount = 0;
    let evaluatedCount = 0;
    const leadsToInsert: any[] = [];

    // 5. Evaluate each lead with Gemini AI using Posivex AI profile
    for (const item of items) {
      const leadData = mapItemToLead(item, campaign);

      try {
        const evaluation = await evaluateLeadWithGemini(leadData, customPrompt, aiModel);
        leadData.aiScore = evaluation.score;
        leadData.aiReasoning = evaluation.reasoning;
        leadData.outreachHook = evaluation.outreachHook;
        leadData.enriched = true;
        leadData.status = evaluation.score >= threshold ? "qualified" : "disqualified";

        if (evaluation.score >= threshold) {
          qualifiedCount++;
        }
      } catch (aiErr) {
        console.warn("AI evaluation fallback for lead:", leadData.name);
        leadData.aiScore = 70;
        leadData.enriched = true;
        leadData.status = "qualified";
        qualifiedCount++;
      }

      evaluatedCount++;
      leadsToInsert.push(leadData);
    }

    // 6. Save Leads in bulk
    if (leadsToInsert.length > 0) {
      await Lead.insertMany(leadsToInsert, { ordered: false });
    }

    // 7. Calculate cost & update Campaign to COMPLETED
    const scrapingCost = (leadsToInsert.length / 1000) * 0.4;
    const aiCost = evaluatedCount * 0.0001;
    const totalCost = Number((scrapingCost + aiCost).toFixed(2));

    campaign.status = "COMPLETED";
    campaign.scrapedCount = leadsToInsert.length;
    campaign.aiEvaluatedCount = evaluatedCount;
    campaign.qualifiedCount = qualifiedCount;
    campaign.pendingCount = 0;
    campaign.estimatedCost = totalCost;
    campaign.datasetId = datasetId;
    campaign.apifyRunId = apifyRun.runId;

    await campaign.save();
    console.log(`Campaign ${campaign.title} successfully completed! Scraped: ${leadsToInsert.length}`);
  } catch (error: any) {
    console.error(`Error in executeCampaignScrape for ${campaignId}:`, error?.message || error);
    await connectToDatabase();
    await Campaign.findByIdAndUpdate(campaignId, {
      status: "FAILED",
      errorMessage: error?.message || "Execution failed",
      pendingCount: 0,
    });
  }
}
