import { NextRequest, NextResponse } from "next/server";
import { reevaluateLead } from "@/services/lead.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const enrichedLead = await reevaluateLead(id);

    return NextResponse.json({
      success: true,
      message: "Lead re-evaluated with Gemini AI successfully",
      data: enrichedLead,
    });
  } catch (error: any) {
    console.error("Failed to enrich lead:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to enrich lead" },
      { status: 500 }
    );
  }
}
