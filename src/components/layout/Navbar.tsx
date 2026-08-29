"use client";

import { Plus } from "lucide-react";
import React from "react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenNewCampaign?: () => void;
  showCampaignBtn?: boolean;
}

export default function Navbar({
  title = "LeadGen AI Dashboard",
  subtitle = "Monitor lead campaigns and qualify target businesses with Gemini AI.",
  onOpenNewCampaign,
  showCampaignBtn = true,
}: NavbarProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>

      {showCampaignBtn && onOpenNewCampaign && (
        <button
          onClick={onOpenNewCampaign}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-glow hover:shadow-indigo-500/30 active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Launch New Campaign</span>
        </button>
      )}
    </header>
  );
}
