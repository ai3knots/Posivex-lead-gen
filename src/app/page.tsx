"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import StatCard from "@/components/dashboard/StatCard";
import LatestCampaignCard from "@/components/dashboard/LatestCampaignCard";
import NewCampaignModal from "@/components/campaigns/NewCampaignModal";
import { CloudDownload, Cpu, Percent } from "lucide-react";
import { ICampaign } from "@/models/Campaign";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalScrapedLeads: 0,
    totalQualifiedLeads: 0,
    qualificationRate: 0,
  });
  const [latestCampaign, setLatestCampaign] = useState<ICampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    try {
      const [statsRes, campRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/campaigns/latest"),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      const campData = await campRes.json();
      if (campData.success) {
        setLatestCampaign(campData.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh periodically for active runs
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <Navbar
        title="LeadGen AI Dashboard"
        subtitle="Monitor lead campaigns and qualify target businesses with Gemini AI."
        onOpenNewCampaign={() => setIsModalOpen(true)}
      />

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="TOTAL SCRAPED LEADS"
          value={stats.totalScrapedLeads}
          icon={<CloudDownload className="w-7 h-7" />}
          iconBgColor="bg-blue-600/20 text-blue-400 border border-blue-500/30"
        />

        <StatCard
          label="AI QUALIFIED LEADS"
          value={stats.totalQualifiedLeads}
          icon={<Cpu className="w-7 h-7" />}
          iconBgColor="bg-purple-600/20 text-purple-400 border border-purple-500/30"
        />

        <StatCard
          label="AI QUALIFICATION RATE"
          value={`${stats.qualificationRate}%`}
          icon={<Percent className="w-7 h-7" />}
          iconBgColor="bg-amber-600/20 text-amber-400 border border-amber-500/30"
        />
      </div>

      {/* Latest Campaign Run Highlight */}
      <LatestCampaignCard campaign={latestCampaign} />

      {/* New Campaign Modal */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
}
