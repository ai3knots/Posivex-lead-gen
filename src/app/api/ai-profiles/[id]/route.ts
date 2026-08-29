import { NextRequest, NextResponse } from "next/server";
import { getAiProfile, updateAiProfile, deleteAiProfile } from "@/services/ai-profile.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const profile = await getAiProfile(id);
    if (!profile) {
      return NextResponse.json({ success: false, error: "AI Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateAiProfile(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "AI Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteAiProfile(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Cannot delete default profile or profile not found" }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "AI Profile deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete profile" }, { status: 500 });
  }
}
