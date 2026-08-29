import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Posivex - AI Lead Generation Platform",
  description: "AI-powered Google Maps scraping and lead qualification platform for Posivex.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c0f1d] text-slate-100 flex min-h-screen antialiased">
        <SessionProviderWrapper>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
