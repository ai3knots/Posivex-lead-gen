"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadsTable from "@/components/leads/LeadsTable";
import { ILead } from "@/models/Lead";
import { ICampaign } from "@/models/Campaign";

function LeadsContent() {
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaignId") || "all";

  const [leads, setLeads] = useState<ILead[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [search, setSearch] = useState("");
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [hasWebsite, setHasWebsite] = useState<"all" | "yes" | "no">("all");
  const [loading, setLoading] = useState(true);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/campaigns");
      const json = await res.json();
      if (json.success) setCampaigns(json.data);
    } catch (err) {
      console.error("Failed to load campaigns for filter:", err);
    }
  }

  async function loadLeads() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (campaignId && campaignId !== "all") params.append("campaignId", campaignId);
      if (hasWebsite !== "all") params.append("hasWebsite", hasWebsite);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.leads);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [search, campaignId, hasWebsite]);

  async function handleEnrich(id: string) {
    try {
      const res = await fetch(`/api/leads/${id}/enrich`, { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setLeads((prev) =>
          prev.map((l) => (l._id.toString() === id ? json.data : l))
        );
      }
    } catch (err) {
      console.error("Enrich failed:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l._id.toString() !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  function handleExportCsv() {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (campaignId && campaignId !== "all") params.append("campaignId", campaignId);
    if (hasWebsite !== "all") params.append("hasWebsite", hasWebsite);

    window.open(`/api/leads/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          AI Qualified Leads
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          High-value prospects evaluated by Gemini AI as ideal outsourcing fits for Posivex.
        </p>
      </div>

      {/* Filter Bar */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
        hasWebsite={hasWebsite}
        onHasWebsiteChange={setHasWebsite}
        campaigns={campaigns}
        onExportCsv={handleExportCsv}
      />

      {/* Leads Table */}
      <LeadsTable
        leads={leads}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">Loading leads view...</div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
