import { NextRequest, NextResponse } from "next/server";
import { getLeads, exportLeadsToCsv } from "@/services/lead.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const campaignId = searchParams.get("campaignId") || undefined;
    const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined;
    const hasWebsite = (searchParams.get("hasWebsite") as "all" | "yes" | "no") || "all";

    // Fetch up to 5000 leads for export
    const { leads } = await getLeads({
      search,
      campaignId,
      minScore,
      hasWebsite,
      page: 1,
      limit: 5000,
    });

    const csvContent = exportLeadsToCsv(leads);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `posivex_leads_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Failed to export leads CSV:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to export leads" },
      { status: 500 }
    );
  }
}
