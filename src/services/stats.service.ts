import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Campaign } from "@/models/Campaign";

export interface DashboardStats {
  totalScrapedLeads: number;
  totalQualifiedLeads: number;
  qualificationRate: number;
  totalCampaigns: number;
  activeCampaigns: number;
}

/**
 * Aggregates platform-wide metrics for the top dashboard overview.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  const [totalScraped, totalQualified, totalCampaigns, activeCampaigns] =
    await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ aiScore: { $gte: 50 } }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: { $in: ["RUNNING", "PENDING"] } }),
    ]);

  const qualificationRate =
    totalScraped > 0 ? Math.round((totalQualified / totalScraped) * 100) : 0;

  return {
    totalScrapedLeads: totalScraped,
    totalQualifiedLeads: totalQualified,
    qualificationRate,
    totalCampaigns,
    activeCampaigns,
  };
}
