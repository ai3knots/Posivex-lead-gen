import { connectToDatabase } from "@/lib/db";
import { Setting, ISetting, DEFAULT_PROMPT } from "@/models/Setting";

/**
 * Retrieves the application settings document (or initializes default).
 */
export async function getAppSettings(): Promise<ISetting> {
  await connectToDatabase();

  let setting = await Setting.findOne({ key: "app_config" });
  if (!setting) {
    setting = await Setting.create({
      key: "app_config",
      systemPrompt: DEFAULT_PROMPT,
      scoringThreshold: 50,
      aiModel: "gemini-1.5-flash",
      adminEmail: "admin@posivex.com",
    });
  }

  return setting;
}

/**
 * Updates system prompt and AI evaluation parameters.
 */
export async function updateAppSettings(updates: Partial<ISetting>): Promise<ISetting | null> {
  await connectToDatabase();

  return Setting.findOneAndUpdate(
    { key: "app_config" },
    { $set: updates },
    { new: true, upsert: true }
  );
}
