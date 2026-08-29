import { NextRequest, NextResponse } from "next/server";
import { executeCampaignScrape } from "@/services/campaign.service";
import { inngest } from "@/lib/inngest";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Dispatch to Inngest
    try {
      await inngest.send({
        name: "campaign/start",
        data: { campaignId: id },
      });
    } catch (err: any) {
      console.warn("Inngest send notice:", err?.message);
    }

    // Trigger direct runner in background
    executeCampaignScrape(id).catch((err) => {
      console.error("Direct scrape runner error:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Campaign scraping started successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to start campaign" },
      { status: 500 }
    );
  }
}
