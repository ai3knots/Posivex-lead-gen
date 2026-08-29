import { NextResponse } from "next/server";
import { getLatestCampaign } from "@/services/campaign.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaign = await getLatestCampaign();
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error("Failed to get latest campaign:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to get latest campaign" },
      { status: 500 }
    );
  }
}
