import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/services/lead.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const campaignId = searchParams.get("campaignId") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined;
    const hasWebsite = (searchParams.get("hasWebsite") as "all" | "yes" | "no") || "all";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const result = await getLeads({
      search,
      campaignId,
      platform,
      minScore,
      hasWebsite,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
