import { connectToDatabase } from "@/lib/db";
import { Lead, ILead } from "@/models/Lead";
import { evaluateLeadWithGemini } from "./gemini.service";
import mongoose from "mongoose";

export interface LeadFilterOptions {
  search?: string;
  campaignId?: string;
  platform?: string;
  minScore?: number;
  hasWebsite?: "all" | "yes" | "no";
  page?: number;
  limit?: number;
}

/**
 * Builds MongoDB query filters based on user selection.
 */
export function buildLeadFilter(filters: LeadFilterOptions) {
  const query: Record<string, any> = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { category: { $regex: filters.search, $options: "i" } },
      { city: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.campaignId && filters.campaignId !== "all") {
    if (mongoose.Types.ObjectId.isValid(filters.campaignId)) {
      query.campaignId = new mongoose.Types.ObjectId(filters.campaignId);
    }
  }

  if (filters.platform && filters.platform !== "all") {
    query.platform = filters.platform;
  }

  if (typeof filters.minScore === "number") {
    query.aiScore = { $gte: filters.minScore };
  }

  if (filters.hasWebsite === "yes") {
    query.website = { $nin: ["", "Not Provided", "None", null] };
  } else if (filters.hasWebsite === "no") {
    query.website = { $in: ["", "Not Provided", "None", null] };
  }

  return query;
}

/**
 * Retrieves paginated leads with filtering options.
 */
export async function getLeads(filters: LeadFilterOptions = {}) {
  await connectToDatabase();

  const query = buildLeadFilter(filters);
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 50));
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(query).sort({ aiScore: -1, createdAt: -1 }).skip(skip).limit(limit).lean() as unknown as Promise<ILead[]>,
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Retrieves a single lead by its MongoDB ID.
 */
export async function getLeadById(id: string): Promise<ILead | null> {
  await connectToDatabase();
  return Lead.findById(id).lean() as unknown as Promise<ILead | null>;
}

/**
 * Saves a batch of leads into the database.
 */
export async function saveBatchLeads(leads: Partial<ILead>[]) {
  await connectToDatabase();
  return Lead.insertMany(leads, { ordered: false });
}

/**
 * Updates a single lead record.
 */
export async function updateLead(id: string, updates: Partial<ILead>) {
  await connectToDatabase();
  return Lead.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

/**
 * Deletes a lead by ID.
 */
export async function deleteLead(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await Lead.findByIdAndDelete(id);
  return !!res;
}

/**
 * Re-evaluates a lead with Gemini AI.
 */
export async function reevaluateLead(id: string) {
  await connectToDatabase();
  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  const evaluation = await evaluateLeadWithGemini(lead);
  lead.aiScore = evaluation.score;
  lead.aiReasoning = evaluation.reasoning;
  lead.outreachHook = evaluation.outreachHook;
  lead.enriched = true;
  lead.status = evaluation.score >= 50 ? "qualified" : "disqualified";

  await lead.save();
  return lead;
}

/**
 * Converts a list of leads to a formatted CSV string.
 */
export function exportLeadsToCsv(leads: any[]): string {
  const headers = [
    "Name",
    "Category",
    "Platform",
    "Campaign",
    "AI Score",
    "Phone",
    "Website",
    "Address",
    "Rating",
    "Reviews",
    "Google Claimed",
    "Google Ads Status",
    "AI Reasoning",
    "Suggested Outreach Hook",
  ];

  const rows = leads.map((l) => [
    `"${(l.name || "").replace(/"/g, '""')}"`,
    `"${(l.category || "").replace(/"/g, '""')}"`,
    `"${l.platform || ""}"`,
    `"${(l.campaignTitle || "").replace(/"/g, '""')}"`,
    l.aiScore || 0,
    `"${(l.phone || "").replace(/"/g, '""')}"`,
    `"${(l.website || "").replace(/"/g, '""')}"`,
    `"${(l.address || "").replace(/"/g, '""')}"`,
    l.rating || 0,
    l.reviewsCount || 0,
    `"${l.googleClaimed || ""}"`,
    `"${l.googleAdsStatus || ""}"`,
    `"${(l.aiReasoning || "").replace(/"/g, '""')}"`,
    `"${(l.outreachHook || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
