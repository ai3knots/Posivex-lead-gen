import { NextRequest, NextResponse } from "next/server";
import { listAiProfiles, createAiProfile } from "@/services/ai-profile.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await listAiProfiles();
    return NextResponse.json({ success: true, data: profiles });
  } catch (error: any) {
    console.error("Failed to list AI profiles:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch AI profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Profile name is required" },
        { status: 400 }
      );
    }

    const profile = await createAiProfile(body);
    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create AI profile:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create AI profile" },
      { status: 500 }
    );
  }
}
