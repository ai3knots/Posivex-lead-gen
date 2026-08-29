"use client";

import React from "react";
import { Search, Download, Filter, MapPin } from "lucide-react";
import { ICampaign } from "@/models/Campaign";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  campaignId: string;
  onCampaignChange: (val: string) => void;
  hasWebsite: "all" | "yes" | "no";
  onHasWebsiteChange: (val: "all" | "yes" | "no") => void;
  campaigns: ICampaign[];
  onExportCsv: () => void;
}

export default function LeadFilters({
  search,
  onSearchChange,
  campaignId,
  onCampaignChange,
  hasWebsite,
  onHasWebsiteChange,
  campaigns,
  onExportCsv,
}: LeadFiltersProps) {
  return (
    <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg mb-6">
      {/* Left search & dropdown filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-64 md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search qualified companies..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
          />
        </div>

        {/* Website filter */}
        <select
          value={hasWebsite}
          onChange={(e) => onHasWebsiteChange(e.target.value as any)}
          className="px-3.5 py-2 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-slate-200 text-xs"
        >
          <option value="all">All URLs</option>
          <option value="yes">With Website</option>
          <option value="no">No Website</option>
        </select>

        {/* Campaign filter */}
        <select
          value={campaignId}
          onChange={(e) => onCampaignChange(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-slate-200 text-xs max-w-[180px] truncate"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c._id?.toString()} value={c._id?.toString()}>
              #{c.campaignNumber} - {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Right actions: Export CSV */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>GOOGLE MAPS</span>
        </div>

        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c2345] hover:bg-[#252e59] border border-[#2e3966] text-white text-xs font-medium transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
