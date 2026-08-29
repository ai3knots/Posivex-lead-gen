import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { scrapeCampaignWorkflow } from "@/inngest/functions/scrapeCampaign";

/**
 * Next.js route handler to serve Inngest functions and webhooks.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scrapeCampaignWorkflow],
});
