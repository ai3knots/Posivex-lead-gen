"use client";

import React from "react";
import Link from "next/link";
import { ICampaign } from "@/models/Campaign";
import { Check, Clock, AlertTriangle, Eye, Trash2, MapPin } from "lucide-react";

interface CampaignTableProps {
  campaigns: ICampaign[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function CampaignTable({
  campaigns,
  onDelete,
  loading = false,
}: CampaignTableProps) {
  if (loading) {
    return (
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading scraping campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-12 text-center">
        <MapPin className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h4 className="text-base font-bold text-white mb-1">No campaigns created yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Click the button above to launch your first Google Maps search campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#12172b] border border-[#21284d] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f2648] bg-[#0e1224] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Campaign Info</th>
              <th className="py-4 px-6">Status & Progress</th>
              <th className="py-4 px-6">AI Profile</th>
              <th className="py-4 px-6">Leads</th>
              <th className="py-4 px-6">Est. Cost</th>
              <th className="py-4 px-6">Started On</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2140] text-sm">
            {campaigns.map((camp) => {
              const formattedDate = new Date(camp.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={camp._id?.toString()}
                  className="hover:bg-[#161c36] transition-colors group"
                >
                  {/* Campaign info */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-white group-hover:text-indigo-300 transition">
                      {camp.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>#{camp.campaignNumber || 1}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold">
                        <MapPin className="w-2.5 h-2.5" />
                        Maps
                      </span>
                      {camp.location && (
                        <>
                          <span>•</span>
                          <span>in {camp.location}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {camp.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/50 border border-emerald-600/40 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        COMPLETED
                      </span>
                    )}
                    {camp.status === "RUNNING" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-950/50 border border-blue-600/40 text-blue-400 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        RUNNING
                      </span>
                    )}
                    {camp.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-950/50 border border-amber-600/40 text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        QUEUED
                      </span>
                    )}
                    {camp.status === "FAILED" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-950/50 border border-rose-600/40 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        FAILED
                      </span>
                    )}
                  </td>

                  {/* AI Profile */}
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-lg bg-[#1a213e] border border-[#26305a] text-slate-300 text-xs font-medium">
                      {camp.aiProfile || "Default Profile"}
                    </span>
                  </td>

                  {/* Leads count */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">
                      {camp.scrapedCount || camp.limit}
                    </div>
                    <div className="text-[11px] text-slate-400">LEADS</div>
                  </td>

                  {/* Est cost */}
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    ${(camp.estimatedCost || 0).toFixed(2)}
                  </td>

                  {/* Started on */}
                  <td className="py-4 px-6 text-xs text-slate-400">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Run / Re-run button */}
                      {camp.status !== "RUNNING" && (
                        <button
                          onClick={async () => {
                            try {
                              await fetch(`/api/campaigns/${camp._id}/run`, { method: "POST" });
                              window.location.reload();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          title="Start / Re-run Scrape"
                          className="p-2 rounded-lg bg-[#18203c] hover:bg-emerald-950/60 hover:text-emerald-400 border border-[#242c52] text-slate-400 transition"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onDelete(camp._id.toString())}
                        title="Delete campaign"
                        className="p-2 rounded-lg bg-[#18203c] hover:bg-rose-950/60 hover:text-rose-400 border border-[#242c52] text-slate-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/leads?campaignId=${camp._id}`}
                        title="View Leads"
                        className="p-2 rounded-lg bg-[#18203c] hover:bg-indigo-900/40 hover:text-indigo-400 border border-[#242c52] text-slate-400 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
