"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Sparkles,
  MapPin,
  Globe,
  Phone,
  Copy,
  Check,
  Megaphone,
  Cpu,
  Loader2,
} from "lucide-react";
import { ILead } from "@/models/Lead";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ILead>>({});

  async function loadLead() {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const json = await res.json();
      if (json.success) {
        setLead(json.data);
        setEditData(json.data);
      }
    } catch (err) {
      console.error("Failed to load lead details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLead();
  }, [id]);

  async function handleEnrich() {
    setEnriching(true);
    try {
      const res = await fetch(`/api/leads/${id}/enrich`, { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setLead(json.data);
      }
    } catch (err) {
      console.error("Enrich failed:", err);
    } finally {
      setEnriching(false);
    }
  }

  async function handleSaveEdit() {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLead(json.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Save edit failed:", err);
    }
  }

  function handleCopyHook() {
    if (!lead?.outreachHook) return;
    navigator.clipboard.writeText(lead.outreachHook);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading prospect intelligence...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Lead Not Found</h3>
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Qualified Leads</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b223f]">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="p-2 rounded-xl bg-[#141a33] hover:bg-[#1c2447] border border-[#21284d] text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {lead.name}
            </h1>
            <p className="text-xs text-indigo-400 font-medium mt-0.5">
              {lead.category || "Prospect Profile"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {lead.googleMapsUrl && (
            <a
              href={lead.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141a33] hover:bg-[#1c2447] border border-[#21284d] text-slate-200 text-xs font-medium transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141a33] hover:bg-[#1c2447] border border-[#21284d] text-slate-200 text-xs font-medium transition"
          >
            <Edit className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEditing ? "Cancel" : "Edit Lead"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Details & Verification */}
        <div className="lg:col-span-7 space-y-6">
          {/* Business Info Card */}
          <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{lead.category || "Business"}</span>
                </p>
              </div>
            </div>

            {/* Quick Contact Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0c1021] border border-[#1d2547] rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#141a33] flex items-center justify-center text-slate-400 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Corporate Site
                  </p>
                  {lead.website && lead.website !== "Not Provided" && lead.website !== "None" ? (
                    <a
                      href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:underline truncate block"
                    >
                      {lead.domain || lead.website}
                    </a>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400">Not Provided</p>
                  )}
                </div>
              </div>

              <div className="bg-[#0c1021] border border-[#1d2547] rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#141a33] flex items-center justify-center text-slate-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {lead.phone || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Description / Profile List */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Business Description / Info
              </h3>

              {isEditing ? (
                <div className="space-y-3 bg-[#0a0d1b] p-4 rounded-xl border border-[#21284d]">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141a33] border border-[#242c52] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                    <input
                      type="text"
                      value={editData.category || ""}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141a33] border border-[#242c52] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Address</label>
                    <input
                      type="text"
                      value={editData.address || ""}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141a33] border border-[#242c52] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editData.phone || ""}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141a33] border border-[#242c52] text-white text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0c1021] border border-[#1d2547] rounded-xl p-4 text-xs space-y-2 text-slate-300">
                  <p className="font-semibold text-white">Business Profile:</p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    <li>
                      <strong className="text-slate-400">Name:</strong> {lead.name}
                    </li>
                    <li>
                      <strong className="text-slate-400">Category:</strong> {lead.category}
                    </li>
                    <li>
                      <strong className="text-slate-400">Rating:</strong> {lead.rating || 0} stars ({lead.reviewsCount || 0} reviews)
                    </li>
                    <li>
                      <strong className="text-slate-400">Phone Number:</strong> {lead.phone || "Not Provided"}
                    </li>
                    <li>
                      <strong className="text-slate-400">Address:</strong> {lead.address || "Not Provided"}
                    </li>
                    <li>
                      <strong className="text-slate-400">Website:</strong> {lead.website || "N/A"}
                    </li>
                    <li>
                      <strong className="text-slate-400">Opening Hours:</strong> {lead.openingHours || "Not Available"}
                    </li>
                    <li>
                      <strong className="text-slate-400">Google Claimed/Verified:</strong> {lead.googleClaimed || "N/A"}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Google Ads Verification */}
          <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Google Ads Verification
              </h3>
            </div>
            <div className="bg-[#0c1021] border border-[#1d2547] rounded-xl p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Google Ads Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#181e38] border border-[#27325c] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>{lead.googleAdsStatus || "Not Running Ads"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assessment & Suggested Outreach Hook */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 space-y-5">
            {/* Header with Match Score Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2648]">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">AI Assessment</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  MATCH SCORE
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-400 font-extrabold text-sm shadow-glow-emerald">
                  {lead.aiScore}
                </span>
              </div>
            </div>

            {/* AI Reasoning */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                AI Reasoning
              </p>
              <div className="bg-[#0c1021] border border-[#1f274a] rounded-xl p-4 text-xs text-slate-300 leading-relaxed italic relative">
                <p>
                  &ldquo;{lead.aiReasoning || `${lead.name} exhibits significant growth potential for Posivex digital marketing, web optimization, and client acquisition services.`}&rdquo;
                </p>
              </div>
            </div>

            {/* Suggested Outreach Hook with Copy Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Suggested Outreach Hook</span>
                </p>
                <button
                  onClick={handleCopyHook}
                  title="Copy Outreach Hook"
                  className="p-1 rounded hover:bg-[#1a213e] text-slate-400 hover:text-white transition"
                >
                  {copiedHook ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="bg-gradient-to-br from-indigo-950/40 to-[#0e1224] border border-indigo-500/30 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
                <p>
                  &ldquo;{lead.outreachHook || `I noticed that ${lead.name} has great customer feedback in ${lead.city || "your area"}, but there is a major opportunity to scale your lead flow with digital outreach. At Posivex, we specialize in high-converting acquisition funnels.`}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
