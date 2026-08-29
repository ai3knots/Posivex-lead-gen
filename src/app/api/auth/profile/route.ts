import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateProfile, changePassword } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || "admin@posivex.com";

    const body = await req.json();

    if (body.action === "update_profile") {
      const updated = await updateProfile(email, body.name);
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.action === "change_password") {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json(
          { success: false, error: "Current and new passwords are required" },
          { status: 400 }
        );
      }
      await changePassword(email, body.currentPassword, body.newPassword);
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
