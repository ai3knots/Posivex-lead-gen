import React from "react";
import Link from "next/link";
import { Rocket, ChevronRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { ICampaign } from "@/models/Campaign";

interface LatestCampaignCardProps {
  campaign: ICampaign | null;
  onViewLeads?: (campaignId: string) => void;
}

export default function LatestCampaignCard({ campaign }: LatestCampaignCardProps) {
  if (!campaign) {
    return (
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-8 text-center mt-6">
        <Rocket className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-white mb-1">No Active Campaigns</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Start your first Google Maps scraping campaign to extract and qualify prospects with Gemini AI.
        </p>
      </div>
    );
  }

  // Calculate evaluation percentage
  const totalTarget = campaign.scrapedCount || campaign.limit || 1;
  const progressPercent = Math.min(
    100,
    Math.round(((campaign.aiEvaluatedCount || 0) / totalTarget) * 100)
  );

  const isCompleted = campaign.status === "COMPLETED";
  const isRunning = campaign.status === "RUNNING";
  const isFailed = campaign.status === "FAILED";

  return (
    <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 md:p-8 mt-6">
      {/* Card Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f2647]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">
                Latest Campaign Run: &quot;{campaign.title}&quot;
              </h2>
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-600/50 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
              {isRunning && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-600/50 text-blue-400 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  Running
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-600/50 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Failed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
              <span>Platform: <strong className="text-slate-200">{campaign.platform}</strong></span>
              <span>•</span>
              <span>City: <strong className="text-slate-200">{campaign.location || "USA"}</strong></span>
              <span>•</span>
              <span>Target Country: <strong className="text-slate-200">{campaign.country?.toUpperCase() || "US"}</strong></span>
              <span>•</span>
              <span>Limit: <strong className="text-slate-200">{campaign.limit} leads</strong></span>
            </p>
          </div>
        </div>

        <Link
          href={`/leads?campaignId=${campaign._id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a213e] hover:bg-[#232c52] border border-[#2b355d] text-slate-200 text-sm font-medium transition self-start md:self-center shrink-0"
        >
          <span>View Campaign Leads</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress & Stats Area */}
      <div className="mt-6 bg-[#0c1021] border border-[#1b223f] rounded-xl p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Evaluation Progress</span>
          <span className="text-indigo-400">{progressPercent}%</span>
        </div>

        {/* Glowing Progress bar */}
        <div className="w-full h-2.5 bg-[#141a33] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5-Column Metric Box */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-[#12172b] border border-[#1d2547] rounded-lg p-3.5 text-center">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Scraped So Far
            </p>
            <p className="text-xl font-bold text-white mt-1">{campaign.scrapedCount}</p>
          </div>

          <div className="bg-[#12172b] border border-[#1d2547] rounded-lg p-3.5 text-center">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Pending / Active
            </p>
            <p className="text-xl font-bold text-white mt-1">{campaign.pendingCount}</p>
          </div>

          <div className="bg-[#12172b] border border-[#1d2547] rounded-lg p-3.5 text-center">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              AI Evaluated
            </p>
            <p className="text-xl font-bold text-white mt-1">{campaign.aiEvaluatedCount}</p>
          </div>

          <div className="bg-[#12172b] border border-[#1d2547] rounded-lg p-3.5 text-center">
            <p className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
              Qualified Leads
            </p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{campaign.qualifiedCount}</p>
          </div>

          <div className="bg-[#12172b] border border-[#1d2547] rounded-lg p-3.5 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Est. Cost
            </p>
            <p className="text-xl font-bold text-white mt-1">
              ${(campaign.estimatedCost || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
