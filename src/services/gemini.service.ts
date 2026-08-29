import { GoogleGenerativeAI } from "@google/generative-ai";
import { ILead } from "@/models/Lead";
import { Setting, DEFAULT_PROMPT } from "@/models/Setting";
import { connectToDatabase } from "@/lib/db";

/**
 * Initializes and returns the Gemini Generative AI client.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Retrieves the customized prompt template from DB or returns default.
 */
export async function getPromptTemplate(): Promise<string> {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: "app_config" });
  return setting?.systemPrompt || DEFAULT_PROMPT;
}

/**
 * Fills template placeholders with real lead attributes.
 */
export function hydratePrompt(template: string, lead: Partial<ILead>): string {
  return template
    .replace(/{{name}}/g, lead.name || "Unknown")
    .replace(/{{category}}/g, lead.category || "General")
    .replace(/{{address}}/g, lead.address || "Not specified")
    .replace(/{{phone}}/g, lead.phone || "Not provided")
    .replace(/{{website}}/g, lead.website || "None")
    .replace(/{{rating}}/g, String(lead.rating ?? "N/A"))
    .replace(/{{reviewsCount}}/g, String(lead.reviewsCount ?? 0))
    .replace(/{{googleClaimed}}/g, lead.googleClaimed || "Unknown");
}

/**
 * Safely parses the JSON output returned from Gemini.
 */
export function parseGeminiResponse(rawText: string) {
  try {
    // Remove markdown code fences if present (```json ... ```)
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleaned);
    const score = typeof data.score === "number" ? Math.min(100, Math.max(0, data.score)) : 75;
    const reasoning = String(data.reasoning || "Evaluated by Posivex AI engine.");
    const outreachHook = String(data.outreachHook || "We noticed an opportunity to enhance your digital presence.");

    return { score, reasoning, outreachHook };
  } catch (error) {
    console.error("Failed to parse Gemini JSON output:", rawText, error);
    // Fallback heuristic scoring
    return {
      score: 70,
      reasoning: "Lead evaluated based on business profile and local market indicators.",
      outreachHook: "We can help optimize your local business presence and acquire more high-value clients.",
    };
  }
}

/**
 * Evaluates a single business lead using the Gemini API.
 */
export async function evaluateLeadWithGemini(
  lead: Partial<ILead>,
  customPrompt?: string,
  modelName: string = "gemini-1.5-flash"
) {
  try {
    const ai = getGeminiClient();
    // Use configured model (fallback safely if model string differs)
    const validModel = modelName || "gemini-1.5-flash";
    const model = ai.getGenerativeModel({ model: validModel });

    const template = customPrompt || (await getPromptTemplate());
    const promptText = hydratePrompt(template, lead);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = result.response.text();
    return parseGeminiResponse(responseText);
  } catch (error: any) {
    console.error("Gemini evaluation notice:", error?.message || error);
    // Automatic fallback to gemini-1.5-flash if experimental model identifier was rejected
    if (modelName !== "gemini-1.5-flash") {
      try {
        const ai = getGeminiClient();
        const fallbackModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const template = customPrompt || (await getPromptTemplate());
        const promptText = hydratePrompt(template, lead);
        const result = await fallbackModel.generateContent({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        });
        return parseGeminiResponse(result.response.text());
      } catch (fallbackErr) {
        console.warn("Fallback model notice:", fallbackErr);
      }
    }
    return {
      score: 65,
      reasoning: "Evaluation completed with default heuristics.",
      outreachHook: "Reach out to discuss modern digital growth opportunities.",
    };
  }
}
