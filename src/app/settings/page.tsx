"use client";

import React, { useEffect, useState } from "react";
import { User, Lock, Sparkles, Check, AlertCircle, Save, Sliders } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  // Profile Form State
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@posivex.com");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // AI Prompt Settings State
  const [systemPrompt, setSystemPrompt] = useState("");
  const [scoringThreshold, setScoringThreshold] = useState(50);
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");
  const [promptMsg, setPromptMsg] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "Admin User");
      setEmail(session.user.email || "admin@posivex.com");
    }

    // Load AI Prompt Settings
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setSystemPrompt(json.data.systemPrompt);
          setScoringThreshold(json.data.scoringThreshold || 50);
          setAiModel(json.data.aiModel || "gemini-1.5-flash");
        }
      } catch (err) {
        console.error("Failed to load prompt settings:", err);
      }
    }
    loadSettings();
  }, [session]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", name }),
      });
      const json = await res.json();
      if (json.success) {
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      } else {
        setProfileMsg(json.error || "Failed to update profile");
      }
    } catch (err: any) {
      setProfileMsg(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg({ type: "", text: "" }), 3000);
      } else {
        setPasswordMsg({ type: "error", text: json.error || "Failed to update password" });
      }
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSavePrompt(e: React.FormEvent) {
    e.preventDefault();
    setPromptLoading(true);
    setPromptMsg("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          scoringThreshold: Number(scoringThreshold),
          aiModel,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPromptMsg("Gemini AI configuration saved successfully!");
        setTimeout(() => setPromptMsg(""), 3000);
      }
    } catch (err: any) {
      setPromptMsg(err.message || "Failed to save AI configuration");
    } finally {
      setPromptLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Update your account profile and security settings.
        </p>
      </div>

      {/* Profile Information Box */}
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#1b2241]">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Profile Information</h2>
        </div>

        {profileMsg && (
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-4 py-2.5 rounded-xl bg-[#080b17] border border-[#1d2345] text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition disabled:opacity-50"
            >
              <User className="w-4 h-4" />
              <span>{profileLoading ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Box */}
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#1b2241]">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Change Password</h2>
        </div>

        {passwordMsg.text && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              passwordMsg.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                : "bg-rose-950/50 border-rose-500/50 text-rose-300"
            }`}
          >
            {passwordMsg.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm placeholder:text-slate-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Gemini AI Prompt Configuration */}
      <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#1b2241]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Gemini AI Qualification Prompt
            </h2>
          </div>
          <span className="text-xs text-indigo-400 font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/40">
            Dynamic Evaluation Engine
          </span>
        </div>

        {promptMsg && (
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{promptMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePrompt} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                System Prompt Template
              </label>
              <span className="text-[11px] text-slate-400">
                Variables: &#123;&#123;name&#125;&#125;, &#123;&#123;category&#125;&#125;, &#123;&#123;website&#125;&#125;, &#123;&#123;rating&#125;&#125;, &#123;&#123;phone&#125;&#125;
              </span>
            </div>
            <textarea
              rows={9}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-slate-200 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Qualification Threshold Score (0 - 100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={scoringThreshold}
                onChange={(e) => setScoringThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Gemini AI Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0c1021] border border-[#21284d] focus:border-indigo-500 focus:outline-none text-white text-sm"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast &amp; Cost-Effective)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={promptLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-glow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{promptLoading ? "Saving..." : "Save AI Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
