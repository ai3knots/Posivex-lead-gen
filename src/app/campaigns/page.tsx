"use client";

import React, { useEffect, useState } from "react";
import CampaignTable from "@/components/campaigns/CampaignTable";
import NewCampaignModal from "@/components/campaigns/NewCampaignModal";
import { Plus, History, MapPin } from "lucide-react";
import { ICampaign } from "@/models/Campaign";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadCampaigns() {
    try {
      const url =
        filterSource === "all"
          ? "/api/campaigns"
          : `/api/campaigns?platform=${encodeURIComponent(filterSource)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
    const interval = setInterval(loadCampaigns, 8000);
    return () => clearInterval(interval);
  }, [filterSource]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this campaign and all its leads?")) {
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c._id.toString() !== id));
      }
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Scraping Campaigns
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View details, active run states, and collected leads from historical keyword scraping runs.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#141a33] border border-[#21284d] text-slate-300 text-xs font-semibold">
            Total Campaigns: <span className="text-white">{campaigns.length}</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition shadow-glow shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter and History Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Execution History</h2>
        </div>

        <div className="flex items-center gap-2 bg-[#12172b] border border-[#21284d] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterSource("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterSource === "all"
                ? "bg-[#1f274a] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ALL SOURCES
          </button>
          <button
            onClick={() => setFilterSource("Google Maps")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterSource === "Google Maps"
                ? "bg-[#1f274a] text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>GOOGLE MAPS</span>
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <CampaignTable
        campaigns={campaigns}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Modal */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadCampaigns();
        }}
      />
    </div>
  );
}
