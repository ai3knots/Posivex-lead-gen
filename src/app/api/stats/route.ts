import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/stats.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
