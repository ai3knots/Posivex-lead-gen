import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBgColor = "bg-blue-600/20 text-blue-400 border border-blue-500/30",
}: StatCardProps) {
  return (
    <div className="bg-[#12172b] border border-[#21284d] rounded-2xl p-6 flex items-center gap-5 transition hover:border-[#323d6a] hover:bg-[#151b33]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}
