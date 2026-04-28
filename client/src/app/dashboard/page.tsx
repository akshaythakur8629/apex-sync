"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { performanceApi } from "@/lib/api";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Overview } from "./components/Overview";
import { AthletesSection } from "./components/AthletesSection";
import { UsersSection } from "./components/UsersSection";
import { TeamsSection } from "./components/TeamsSection";
import { AddAthleteDrawer } from "./components/AddAthleteDrawer";

type Section = "overview" | "athletes" | "teams" | "users" | "decisions" | "audit" | "settings";

const SECTION_TITLES: Record<Section, string> = {
  overview:  "Dashboard",
  athletes:  "Athlete Status",
  teams:     "Teams",
  users:     "Users",
  decisions: "Decision Logs",
  audit:     "Audit Trail",
  settings:  "Settings",
};

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-base font-bold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        This section is coming soon. It will be available in a future release.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [showAddAthlete, setShowAddAthlete] = useState(false);

  const { data: roster = [] } = useQuery({
    queryKey: ["roster"],
    queryFn: performanceApi.getRoster,
    staleTime: 60_000,
  });

  const conflictCount = (roster as { hasConflict: boolean }[]).filter((a) => a.hasConflict).length;

  function handleAddAthlete() {
    setActiveSection("athletes");
    setShowAddAthlete(true);
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        active={activeSection}
        onChange={setActiveSection}
        conflictCount={conflictCount}
        onAddAthlete={handleAddAthlete}
      />

      <main className="flex-1 flex flex-col min-h-0 bg-[#f5f0e8]">
        <Navbar title={SECTION_TITLES[activeSection]} />
        <div className="flex-1 overflow-y-auto">
          {activeSection === "overview"  && <Overview />}
          {activeSection === "athletes"  && <AthletesSection onAddAthlete={() => setShowAddAthlete(true)} />}
          {activeSection === "users"     && <UsersSection />}
          {activeSection === "teams"     && <TeamsSection />}
          {activeSection === "decisions" && <ComingSoon title="Decision Logs" />}
          {activeSection === "audit"     && <ComingSoon title="Audit Trail" />}
          {activeSection === "settings"  && <ComingSoon title="Settings" />}
        </div>
      </main>

      {/* Global Add Athlete drawer — accessible from sidebar or within Athletes section */}
      <AddAthleteDrawer
        open={showAddAthlete}
        onClose={() => setShowAddAthlete(false)}
        onSaved={() => {}}
      />
    </div>
  );
}
