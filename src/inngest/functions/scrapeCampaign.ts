import { inngest } from "@/lib/inngest";
import { connectToDatabase } from "@/lib/db";
import { Campaign } from "@/models/Campaign";
import { Lead } from "@/models/Lead";
import {
  startScraperRun,
  checkRunStatus,
  getDatasetItems,
  mapItemToLead,
} from "@/services/apify.service";
import { evaluateLeadWithGemini } from "@/services/gemini.service";

/**
 * Background workflow to run Google Maps scraping via Apify,
 * ingest results into MongoDB, and qualify leads with Gemini AI.
 */
export const scrapeCampaignWorkflow = inngest.createFunction(
  { id: "scrape-and-evaluate-campaign" },
  { event: "campaign/start" },
  async ({ event, step }) => {
    const { campaignId } = event.data;

    // Step 1: Mark Campaign as RUNNING
    const campaign = await step.run("initialize-campaign", async () => {
      await connectToDatabase();
      const camp = await Campaign.findByIdAndUpdate(
        campaignId,
        { status: "RUNNING" },
        { new: true }
      );
      if (!camp) throw new Error("Campaign not found");
      return JSON.parse(JSON.stringify(camp));
    });

    // Step 2: Start Apify Scraper
    const apifyRun = await step.run("start-apify-scraper", async () => {
      return await startScraperRun(
        campaign.query,
        campaign.location,
        campaign.limit,
        campaign.country
      );
    });

    // Step 3: Wait for Apify Scraper to finish (polling loop with step sleep)
    let isFinished = false;
    let datasetId: string | undefined = apifyRun.datasetId;

    for (let attempt = 0; attempt < 20; attempt++) {
      const statusData = await step.run(`check-status-${attempt}`, async () => {
        const run = await checkRunStatus(apifyRun.runId);
        return {
          status: run?.status,
          datasetId: run?.defaultDatasetId,
        };
      });

      if (statusData.status === "SUCCEEDED") {
        isFinished = true;
        if (statusData.datasetId) {
          datasetId = statusData.datasetId;
        }
        break;
      }

      if (statusData.status === "FAILED" || statusData.status === "ABORTED") {
        throw new Error(`Apify Scraper failed with status: ${statusData.status}`);
      }

      // Wait 5 seconds before next check
      await step.sleep(`wait-for-scraper-${attempt}`, "5s");
    }

    if (!isFinished || !datasetId) {
      throw new Error("Scraping timed out or dataset unavailable");
    }

    // Step 4: Fetch dataset items
    const rawItems = await step.run("fetch-dataset-items", async () => {
      return await getDatasetItems(datasetId!);
    });

    // Step 5: Process and Evaluate Leads with Gemini
    const processedStats = await step.run("evaluate-and-store-leads", async () => {
      await connectToDatabase();
      const currentCampaign = await Campaign.findById(campaignId);
      if (!currentCampaign) throw new Error("Campaign missing");

      let qualifiedCount = 0;
      let evaluatedCount = 0;
      const leadsToInsert: any[] = [];

      for (const item of rawItems) {
        const leadData = mapItemToLead(item, currentCampaign);

        // Run Gemini evaluation on lead
        const evaluation = await evaluateLeadWithGemini(leadData);
        leadData.aiScore = evaluation.score;
        leadData.aiReasoning = evaluation.reasoning;
        leadData.outreachHook = evaluation.outreachHook;
        leadData.enriched = true;
        leadData.status = evaluation.score >= 50 ? "qualified" : "disqualified";

        if (evaluation.score >= 50) {
          qualifiedCount++;
        }
        evaluatedCount++;
        leadsToInsert.push(leadData);
      }

      if (leadsToInsert.length > 0) {
        await Lead.insertMany(leadsToInsert, { ordered: false });
      }

      // Calculate cost ($0.40 per 1000 leads + fractional Gemini API cost)
      const scrapingCost = (leadsToInsert.length / 1000) * 0.4;
      const aiCost = evaluatedCount * 0.0001;
      const totalCost = Number((scrapingCost + aiCost).toFixed(2));

      // Step 6: Complete Campaign
      await Campaign.findByIdAndUpdate(campaignId, {
        status: "COMPLETED",
        scrapedCount: leadsToInsert.length,
        aiEvaluatedCount: evaluatedCount,
        qualifiedCount: qualifiedCount,
        pendingCount: 0,
        estimatedCost: totalCost,
        datasetId: datasetId,
        apifyRunId: apifyRun.runId,
      });

      return {
        scrapedCount: leadsToInsert.length,
        qualifiedCount,
        totalCost,
      };
    });

    return {
      success: true,
      campaignId,
      ...processedStats,
    };
  }
);
