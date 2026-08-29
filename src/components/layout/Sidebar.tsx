"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Settings,
  MapPin,
  LogOut,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Scraping Campaigns", href: "/campaigns", icon: Layers },
  { name: "AI Qualified Leads", href: "/leads", icon: Sparkles },
  { name: "AI Config", href: "/ai-config", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-[#0f1325] border-r border-[#202747] flex flex-col justify-between min-h-screen shrink-0 sticky top-0 h-screen z-40">
      {/* Brand Header */}
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-[#1b213e]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide leading-none">
              Posivex
            </h1>
            <span className="text-xs text-indigo-400 font-medium tracking-wider">
              LEAD GEN AI
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#1c2242] text-white border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#141a33]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-indigo-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-[#1b213e] bg-[#0c0f1e]/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#141a33]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm font-semibold text-indigo-300">
              {session?.user?.name ? session.user.name.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-medium text-white truncate">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {session?.user?.email || "admin@posivex.com"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
