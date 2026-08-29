"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ILead } from "@/models/Lead";
import {
  Sparkles,
  Copy,
  Eye,
  Trash2,
  MapPin,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface LeadsTableProps {
  leads: ILead[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function LeadsTable({
  leads,
  onDelete,
  loading = false,
}: LeadsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleCopy(lead: ILead) {
    const textToCopy = `Company: ${lead.name}\nCategory: ${lead.category}\nPhone: ${lead.phone}\nWebsite: ${lead.website}\nAddress: ${lead.address}\nAI Score: ${lead.aiScore}/100\nHook: ${lead.outreachHook || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(lead._id.toString());
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleSelectAll() {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l._id.toString()));
    }
  }

  function toggleSelectOne(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading prospects...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-12 text-center">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
        <h4 className="text-base font-bold text-white mb-1">No qualified leads found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Try adjusting your search query, or launch a new campaign from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#12172b] border border-[#21284d] rounded-2xl overflow-hidden shadow-2xl">
      {/* Table header banner */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d2446] bg-[#0f1429]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Qualified Opportunities (Score &gt;= 50)
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{leads.length}</span> prospects
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1b2140] bg-[#0c1021] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === leads.length}
                  onChange={toggleSelectAll}
                  className="rounded bg-[#141a33] border-[#252d54] text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
              </th>
              <th className="py-3.5 px-6">Lead / Category / Platform</th>
              <th className="py-3.5 px-6">Campaign</th>
              <th className="py-3.5 px-6">Score</th>
              <th className="py-3.5 px-6">AI Profile</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181f3d] text-sm">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead._id.toString());
              const isCopied = copiedId === lead._id.toString();

              return (
                <tr
                  key={lead._id.toString()}
                  className={`hover:bg-[#161c36] transition-colors ${
                    isSelected ? "bg-[#182040]" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(lead._id.toString())}
                      className="rounded bg-[#141a33] border-[#252d54] text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                  </td>

                  {/* Lead / Category / Platform */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="font-bold text-white hover:text-indigo-300 transition"
                      >
                        {lead.name}
                      </Link>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold">
                        <MapPin className="w-2.5 h-2.5" />
                        Maps
                      </span>
                    </div>
                    <div className="text-xs text-indigo-400 font-medium mt-0.5">
                      {lead.category || "General Business"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate max-w-xs">{lead.address || "Address not provided"}</span>
                    </div>
                  </td>

                  {/* Campaign reference */}
                  <td className="py-4 px-6 text-xs text-slate-300">
                    <span className="truncate block max-w-[160px]">
                      {lead.campaignTitle || `#${lead.campaignNumber || 1}`}
                    </span>
                  </td>

                  {/* AI Match Score */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold border ${
                        lead.aiScore >= 80
                          ? "bg-[#112338] border-cyan-500/50 text-cyan-300"
                          : lead.aiScore >= 50
                          ? "bg-[#1a2b2e] border-emerald-500/50 text-emerald-300"
                          : "bg-[#2d1b24] border-rose-500/50 text-rose-300"
                      }`}
                    >
                      {lead.aiScore}/100
                    </span>
                  </td>

                  {/* AI Profile */}
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-lg bg-[#18203c] border border-[#27325c] text-slate-300 text-xs">
                      {lead.aiProfile || "Default Profile"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Copy summary */}
                      <button
                        onClick={() => handleCopy(lead)}
                        title={isCopied ? "Copied!" : "Copy lead details"}
                        className="p-1.5 rounded-lg bg-[#18203c] hover:bg-[#232c52] border border-[#242c52] text-slate-400 hover:text-white transition"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* View detail */}
                      <Link
                        href={`/leads/${lead._id}`}
                        title="View Full Profile"
                        className="p-1.5 rounded-lg bg-[#18203c] hover:bg-indigo-950/60 hover:text-indigo-400 border border-[#242c52] text-slate-400 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(lead._id.toString())}
                        title="Delete lead"
                        className="p-1.5 rounded-lg bg-[#18203c] hover:bg-rose-950/60 hover:text-rose-400 border border-[#242c52] text-slate-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
