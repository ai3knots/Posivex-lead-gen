import { NextResponse } from "next/server";
import { seedDatabase } from "@/scripts/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
