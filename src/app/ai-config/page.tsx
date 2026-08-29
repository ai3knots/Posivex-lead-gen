"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Save,
  Trash2,
  Check,
  Cpu,
  ShieldCheck,
  Code2,
  X,
  Loader2,
} from "lucide-react";
import { IAiProfile } from "@/models/AiProfile";

export default function AiConfigPage() {
  const [profiles, setProfiles] = useState<IAiProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<IAiProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // New Profile State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newNiche, setNewNiche] = useState("General Services");
  const [newModel, setNewModel] = useState("gemini-3.1-flash-lite");
  const [newThreshold, setNewThreshold] = useState(50);
  const [newPrompt, setNewPrompt] = useState("");

  async function loadProfiles() {
    try {
      const res = await fetch("/api/ai-profiles");
      const json = await res.json();
      if (json.success && json.data) {
        setProfiles(json.data);
        if (!activeProfile && json.data.length > 0) {
          setActiveProfile(json.data[0]);
        } else if (activeProfile) {
          const updated = json.data.find(
            (p: IAiProfile) => p._id.toString() === activeProfile._id.toString()
          );
          if (updated) setActiveProfile(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load AI profiles:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  async function handleSaveActiveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProfile) return;

    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch(`/api/ai-profiles/${activeProfile._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeProfile.name,
          description: activeProfile.description,
          systemPrompt: activeProfile.systemPrompt,
          scoringThreshold: Number(activeProfile.scoringThreshold),
          aiModel: activeProfile.aiModel,
          targetNiche: activeProfile.targetNiche,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveMsg("AI Evaluation Profile saved successfully!");
        loadProfiles();
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (err: any) {
      setSaveMsg(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/ai-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          targetNiche: newNiche,
          aiModel: newModel,
          scoringThreshold: Number(newThreshold),
          systemPrompt: newPrompt || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setIsCreating(false);
        setNewName("");
        setNewDesc("");
        loadProfiles();
        setActiveProfile(json.data);
      }
    } catch (err) {
      console.error("Failed to create profile:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProfile(id: string) {
    if (!confirm("Are you sure you want to delete this AI Profile?")) return;

    try {
      const res = await fetch(`/api/ai-profiles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        loadProfiles();
        if (activeProfile?._id.toString() === id) {
          setActiveProfile(profiles[0] || null);
        }
      } else {
        alert(json.error || "Cannot delete default profile");
      }
    } catch (err) {
      console.error("Delete profile failed:", err);
    }
  }

  function insertVariable(varName: string) {
    if (!activeProfile) return;
    setActiveProfile({
      ...activeProfile,
      systemPrompt: (activeProfile.systemPrompt || "") + ` {{${varName}}}`,
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading AI evaluation profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Evaluation Criteria &amp; Profiles
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Define dynamic Gemini AI scoring rubrics, qualification thresholds, and outreach hooks.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-glow self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Profile</span>
        </button>
      </div>

      {/* Main Grid: Left Profile Selector + Right Active Prompt Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Profile Cards */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Configured AI Profiles ({profiles.length})
          </h2>

          {profiles.map((prof) => {
            const isSelected = activeProfile?._id.toString() === prof._id.toString();

            return (
              <div
                key={prof._id.toString()}
                onClick={() => setActiveProfile(prof)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-[#18203f] border-indigo-500 shadow-glow"
                    : "bg-[#12172b] border-[#21284d] hover:border-[#2f3a69] hover:bg-[#151b33]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-white text-sm">{prof.name}</h3>
                  {prof.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
                      DEFAULT
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {prof.description || "Custom AI evaluation rubric for Posivex leads."}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[#202747]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Score &gt;= {prof.scoringThreshold}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {prof.aiModel || "gemini-3.1-flash-lite"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Profile Configuration Editor */}
        <div className="lg:col-span-8">
          {activeProfile ? (
            <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2447]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">
                      Edit Profile: {activeProfile.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize the rubric that Gemini uses to grade and qualify prospective businesses.
                  </p>
                </div>

                {!activeProfile.isDefault && (
                  <button
                    onClick={() => handleDeleteProfile(activeProfile._id.toString())}
                    title="Delete Profile"
                    className="p-2 rounded-xl bg-[#1a213e] hover:bg-rose-950/60 hover:text-rose-400 border border-[#283259] text-slate-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {saveMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{saveMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveActiveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      required
                      value={activeProfile.name}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Outreach Niche
                    </label>
                    <input
                      type="text"
                      value={activeProfile.targetNiche || ""}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, targetNiche: e.target.value })
                      }
                      placeholder="e.g. Contractors, Clinics, Restaurants"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={activeProfile.description || ""}
                    onChange={(e) =>
                      setActiveProfile({ ...activeProfile, description: e.target.value })
                    }
                    placeholder="Brief description of when to use this qualification profile"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Qualification Threshold Score ({activeProfile.scoringThreshold}/100)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      step={5}
                      value={activeProfile.scoringThreshold}
                      onChange={(e) =>
                        setActiveProfile({
                          ...activeProfile,
                          scoringThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-[#0c1021] rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Gemini Model
                    </label>
                    <select
                      value={activeProfile.aiModel || "gemini-3.1-flash-lite"}
                      onChange={(e) =>
                        setActiveProfile({ ...activeProfile, aiModel: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm font-mono"
                    >
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast &amp; Cheap)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Latest General)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Intelligence)</option>
                    </select>
                  </div>
                </div>

                {/* System Prompt Template */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>System Prompt &amp; Evaluation Criteria Template</span>
                    </label>
                  </div>

                  {/* Variable Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2 p-2.5 rounded-xl bg-[#0a0d1b] border border-[#1d2446]">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center">
                      Insert:
                    </span>
                    {["name", "category", "website", "rating", "phone", "address", "reviewsCount", "googleClaimed"].map(
                      (v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-0.5 rounded bg-[#161c38] hover:bg-indigo-900/60 border border-[#28325a] text-indigo-300 text-[11px] font-mono transition"
                        >
                          +&#123;&#123;{v}&#125;&#125;
                        </button>
                      )
                    )}
                  </div>

                  <textarea
                    rows={12}
                    value={activeProfile.systemPrompt}
                    onChange={(e) =>
                      setActiveProfile({
                        ...activeProfile,
                        systemPrompt: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0d1b] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-slate-200 text-xs font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save AI Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a profile on the left to edit its evaluation criteria.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New AI Profile */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#12172b] border border-[#232b4d] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f274a]">
              <h3 className="text-lg font-bold text-white">Create New AI Profile</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Profile Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dental Clinic Acquisition"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Target Outreach Niche
                </label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare, Dental"
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Purpose of this evaluation criteria"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Threshold Score
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Gemini Model
                  </label>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] text-white text-sm font-mono"
                  >
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1f274a]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow"
                >
                  Create AI Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
