import { NextRequest, NextResponse } from "next/server";
import { createCampaign, listCampaigns } from "@/services/campaign.service";
import { inngest } from "@/lib/inngest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || undefined;

    const campaigns = await listCampaigns(platform);
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    console.error("Failed to list campaigns:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.query) {
      return NextResponse.json(
        { success: false, error: "Title and search query are required" },
        { status: 400 }
      );
    }

    // 1. Create campaign in Database via service
    const campaign = await createCampaign({
      title: body.title,
      query: body.query,
      location: body.location || "USA",
      country: body.country || "us",
      limit: Number(body.limit) || 50,
      platform: body.platform || "Google Maps",
      aiProfile: body.aiProfile || "Default Profile",
    });

    // 2. Dispatch background event to Inngest
    try {
      await inngest.send({
        name: "campaign/start",
        data: {
          campaignId: campaign._id.toString(),
        },
      });
    } catch (inngestError: any) {
      console.warn("Inngest dispatch notice:", inngestError?.message);
    }

    // 3. Trigger immediate scrape runner asynchronously in background
    const { executeCampaignScrape } = await import("@/services/campaign.service");
    executeCampaignScrape(campaign._id.toString()).catch((err) => {
      console.error("Background scrape error:", err);
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
