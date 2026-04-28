"use client";

import { useState } from "react";
import { AddAthleteDrawer } from "./AddAthleteDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Athlete {
  id: string;
  name: string;
  position: string;
  status: "available" | "limited" | "unavailable";
  medical: "cleared" | "limited" | "hold";
  load: { value: number; trend: "up" | "down" | "stable"; source: string } | null;
  subjective: { score: number; label: string } | null;
  rehab: { phase: string; daysIn: number } | null;
  dataFreshness: string;
  team: string;
  assignedUserName: string | null;
  dataGaps: string[];
  hasConflict: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const now = Date.now();

const DEMO_ATHLETES: Athlete[] = [
  {
    id: "a1", name: "Jordan Ellis",    position: "Midfielder",          status: "limited",     medical: "limited",
    load: { value: 78, trend: "down",   source: "Catapult" },  subjective: { score: 6,  label: "Fair"      }, rehab: null,
    dataFreshness: new Date(now - 8   * 60 * 1000).toISOString(), team: "First Team",    assignedUserName: "Marcus Okafor",   dataGaps: [],                                   hasConflict: true,
  },
  {
    id: "a2", name: "Marcus Webb",     position: "Centre-Back",         status: "available",   medical: "cleared",
    load: { value: 92, trend: "up",     source: "Catapult" },  subjective: { score: 8,  label: "Good"      }, rehab: null,
    dataFreshness: new Date(now - 12  * 60 * 1000).toISOString(), team: "First Team",    assignedUserName: "Priya Nair",      dataGaps: [],                                   hasConflict: false,
  },
  {
    id: "a3", name: "Theo Nakamura",   position: "Winger",              status: "unavailable", medical: "hold",
    load: null,                                                subjective: { score: 4,  label: "Poor"      }, rehab: { phase: "Phase 2 – Strength Rebuilding", daysIn: 18 },
    dataFreshness: new Date(now - 45  * 60 * 1000).toISOString(), team: "Rehab Group",   assignedUserName: "James Torres",    dataGaps: ["Load data missing"],                hasConflict: false,
  },
  {
    id: "a4", name: "Piers Lawton",    position: "Striker",             status: "limited",     medical: "limited",
    load: { value: 65, trend: "stable", source: "WHOOP" },    subjective: { score: 7,  label: "Good"      }, rehab: null,
    dataFreshness: new Date(now - 3   * 60 * 60 * 1000).toISOString(), team: "First Team", assignedUserName: "Dr. Sarah Chen",  dataGaps: ["Subjective overdue"],               hasConflict: true,
  },
  {
    id: "a5", name: "Camila Reyes",    position: "Goalkeeper",          status: "available",   medical: "cleared",
    load: { value: 88, trend: "stable", source: "Catapult" }, subjective: { score: 9,  label: "Excellent" }, rehab: null,
    dataFreshness: new Date(now - 5   * 60 * 1000).toISOString(), team: "First Team",    assignedUserName: "Coach R. Williams", dataGaps: [],                                 hasConflict: false,
  },
  {
    id: "a6", name: "Dani Kowalski",   position: "Centre-Back",         status: "unavailable", medical: "hold",
    load: null,                                                subjective: null,                              rehab: { phase: "Phase 1 – Acute Management", daysIn: 4 },
    dataFreshness: new Date(now - 2   * 60 * 60 * 1000).toISOString(), team: "Rehab Group",   assignedUserName: "Dr. Kim Singh",   dataGaps: ["Load missing", "Wellness missing"], hasConflict: false,
  },
  {
    id: "a7", name: "Leon Mbeki",      position: "Full-Back",           status: "available",   medical: "cleared",
    load: { value: 95, trend: "up",     source: "Catapult" }, subjective: { score: 8,  label: "Good"      }, rehab: null,
    dataFreshness: new Date(now - 10  * 60 * 1000).toISOString(), team: "Reserve Squad", assignedUserName: "Alex Rivera",     dataGaps: [],                                   hasConflict: false,
  },
  {
    id: "a8", name: "Sophie Okonkwo",  position: "Attacking Midfielder", status: "limited",    medical: "limited",
    load: { value: 70, trend: "down",   source: "Kitman Labs" }, subjective: { score: 5, label: "Fair"    }, rehab: null,
    dataFreshness: new Date(now - 20  * 60 * 1000).toISOString(), team: "Reserve Squad", assignedUserName: "Jordan Patel",    dataGaps: [],                                   hasConflict: true,
  },
  {
    id: "a9", name: "Riku Tanaka",     position: "Centre-Forward",      status: "available",   medical: "cleared",
    load: { value: 83, trend: "stable", source: "WHOOP" },    subjective: { score: 7,  label: "Good"      }, rehab: null,
    dataFreshness: new Date(now - 14  * 60 * 1000).toISOString(), team: "First Team",    assignedUserName: "Marcus Okafor",   dataGaps: [],                                   hasConflict: false,
  },
  {
    id: "a10", name: "Faye Adeyemi",   position: "Full-Back",           status: "available",   medical: "cleared",
    load: { value: 90, trend: "up",     source: "Catapult" }, subjective: { score: 9,  label: "Excellent" }, rehab: null,
    dataFreshness: new Date(now - 7   * 60 * 1000).toISOString(), team: "Reserve Squad", assignedUserName: "Priya Nair",      dataGaps: [],                                   hasConflict: false,
  },
];

const ALL_POSITIONS = [...new Set(DEMO_ATHLETES.map((a) => a.position))].sort();
const ALL_TEAMS     = [...new Set(DEMO_ATHLETES.map((a) => a.team))].sort();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freshnessLabel(iso: string): { label: string; dot: string } {
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  if (mins < 15)  return { label: `${Math.round(mins)}m ago`,           dot: "bg-green-400"  };
  if (mins < 60)  return { label: `${Math.round(mins)}m ago`,           dot: "bg-amber-400"  };
  if (mins < 120) return { label: `${Math.round(mins / 60 * 10) / 10}h ago`, dot: "bg-orange-500" };
  return              { label: `${Math.round(mins / 60)}h ago — stale`, dot: "bg-red-400"    };
}

function initials(name: string) {
  const p = name.trim().split(" ");
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700", "bg-sky-100 text-sky-700", "bg-pink-100 text-pink-700",
];
function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

const STATUS_CFG = {
  available:   { bg: "bg-green-50 text-green-700 border-green-200",   dot: "bg-green-500",  label: "Available"   },
  limited:     { bg: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400",  label: "Limited"     },
  unavailable: { bg: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-400",    label: "Unavailable" },
} as const;

const MEDICAL_CFG = {
  cleared: { bg: "bg-green-50 text-green-700 border-green-200",   label: "Cleared" },
  limited: { bg: "bg-amber-50 text-amber-700 border-amber-200",   label: "Limited" },
  hold:    { bg: "bg-red-50 text-red-700 border-red-200",         label: "Hold"    },
} as const;

// ─── Column header ─────────────────────────────────────────────────────────────

function ColHead({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap">{children}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AthletesSectionProps {
  onAddAthlete: () => void;
}

export function AthletesSection({ onAddAthlete }: AthletesSectionProps) {
  const [view, setView]             = useState<"staff" | "vp">("staff");
  const [search, setSearch]         = useState("");
  const [filterPos, setFilterPos]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMedical, setFilterMedical] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [page, setPage]             = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const PAGE_SIZE = 7;

  function resetPage() { setPage(1); }

  const filtered = DEMO_ATHLETES.filter((a) => {
    const q = search.toLowerCase();
    if (q && !(a.name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) || a.team.toLowerCase().includes(q))) return false;
    if (filterPos    !== "all" && a.position !== filterPos)    return false;
    if (filterStatus !== "all" && a.status   !== filterStatus) return false;
    if (filterMedical !== "all" && a.medical !== filterMedical) return false;
    if (filterTeam   !== "all" && a.team     !== filterTeam)   return false;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage  = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const kpis = [
    { label: "Total athletes", value: DEMO_ATHLETES.length, accent: "bg-gray-800", color: "text-white" },
    { label: "Available",      value: DEMO_ATHLETES.filter((a) => a.status === "available").length,   accent: "bg-emerald-600", color: "text-white" },
    { label: "Limited",        value: DEMO_ATHLETES.filter((a) => a.status === "limited").length,     accent: "bg-amber-500",   color: "text-white" },
    { label: "Unavailable",    value: DEMO_ATHLETES.filter((a) => a.status === "unavailable").length, accent: "bg-red-500",     color: "text-white" },
    { label: "Conflicts",      value: DEMO_ATHLETES.filter((a) => a.hasConflict).length,              accent: "bg-orange-500",  color: "text-white" },
    { label: "Data gaps",      value: DEMO_ATHLETES.filter((a) => a.dataGaps.length > 0).length,      accent: "bg-indigo-600",  color: "text-white" },
  ];

  const selCls = "pl-3.5 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 appearance-none cursor-pointer text-gray-700 relative";

  return (
    <div className="px-8 pb-8 space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map(({ label, value, accent, color }) => (
          <div key={label} className={`${accent} rounded-2xl px-4 py-4 shadow-sm`}>
            <div className={`text-3xl font-extrabold ${color} leading-none`}>{value}</div>
            <div className="text-xs font-semibold text-white/70 mt-1.5">{label}</div>
          </div>
        ))}
      </div>

      {/* View toggle + Add button */}
      <div className="flex items-center gap-3">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
          <button
            onClick={() => setView("staff")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${view === "staff" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            Staff view
          </button>
          <button
            onClick={() => setView("vp")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${view === "vp" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            VP summary
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => { setShowDrawer(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add athlete
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search name, position, team…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 placeholder-gray-400 text-gray-800 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(""); resetPage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Position */}
        <div className="relative">
          <select value={filterPos} onChange={(e) => { setFilterPos(e.target.value); resetPage(); }} className={selCls}>
            <option value="all">All positions</option>
            {ALL_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <svg className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>

        {/* Status */}
        <div className="relative">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} className={selCls}>
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <svg className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>

        {/* Medical */}
        <div className="relative">
          <select value={filterMedical} onChange={(e) => { setFilterMedical(e.target.value); resetPage(); }} className={selCls}>
            <option value="all">All medical</option>
            <option value="cleared">Cleared</option>
            <option value="limited">Limited</option>
            <option value="hold">Hold</option>
          </select>
          <svg className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>

        {/* Team */}
        <div className="relative">
          <select value={filterTeam} onChange={(e) => { setFilterTeam(e.target.value); resetPage(); }} className={selCls}>
            <option value="all">All teams</option>
            {ALL_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <svg className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>

        {(search || filterPos !== "all" || filterStatus !== "all" || filterMedical !== "all" || filterTeam !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterPos("all"); setFilterStatus("all"); setFilterMedical("all"); setFilterTeam("all"); resetPage(); }}
            className="px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Staff view table ── */}
      {view === "staff" && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 1320 }}>
              {/* Header */}
              <div className="grid gap-x-3 px-5 py-3 bg-gray-50 border-b border-gray-100"
                style={{ gridTemplateColumns: "220px 120px 110px 110px 130px 110px 200px 130px 130px 1fr" }}>
                <ColHead>Athlete</ColHead>
                <ColHead>Position</ColHead>
                <ColHead>Status</ColHead>
                <ColHead>Medical</ColHead>
                <ColHead>Load</ColHead>
                <ColHead>Subjective</ColHead>
                <ColHead>Rehab</ColHead>
                <ColHead>Data freshness</ColHead>
                <ColHead>Team</ColHead>
                <ColHead>Assigned to</ColHead>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-400">No athletes match your filters.</div>
                ) : paginated.map((a) => {
                  const { label: freshLabel, dot: freshDot } = freshnessLabel(a.dataFreshness);
                  const aCol = avatarColor(a.name);
                  return (
                    <div
                      key={a.id}
                      className={`grid gap-x-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors ${a.hasConflict ? "border-l-2 border-orange-400" : ""}`}
                      style={{ gridTemplateColumns: "220px 120px 110px 110px 130px 110px 200px 130px 130px 1fr" }}
                    >
                      {/* Athlete */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 ${aCol}`}>
                          {initials(a.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{a.name}</div>
                          {a.hasConflict && <div className="text-[10px] text-orange-500 font-semibold">⚠ Conflict</div>}
                        </div>
                      </div>

                      {/* Position */}
                      <div className="text-xs text-gray-600 font-medium truncate">{a.position}</div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2 py-0.5 rounded-full ${STATUS_CFG[a.status].bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[a.status].dot}`} />
                          {STATUS_CFG[a.status].label}
                        </span>
                      </div>

                      {/* Medical */}
                      <div>
                        <span className={`inline-block text-[11px] font-bold border px-2 py-0.5 rounded-full ${MEDICAL_CFG[a.medical].bg}`}>
                          {MEDICAL_CFG[a.medical].label}
                        </span>
                      </div>

                      {/* Load */}
                      <div>
                        {a.load ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-gray-900">{a.load.value}</span>
                              <span className={`text-xs ${a.load.trend === "up" ? "text-green-500" : a.load.trend === "down" ? "text-red-400" : "text-gray-400"}`}>
                                {a.load.trend === "up" ? "↑" : a.load.trend === "down" ? "↓" : "→"}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400">{a.load.source}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">No data</span>
                        )}
                      </div>

                      {/* Subjective */}
                      <div>
                        {a.subjective ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <span className={`text-sm font-bold ${a.subjective.score >= 7 ? "text-green-600" : a.subjective.score >= 5 ? "text-amber-600" : "text-red-500"}`}>
                                {a.subjective.score}
                              </span>
                              <span className="text-[10px] text-gray-400">/10</span>
                            </div>
                            <div className="text-[10px] text-gray-400">{a.subjective.label}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">No data</span>
                        )}
                      </div>

                      {/* Rehab */}
                      <div className="min-w-0">
                        {a.rehab ? (
                          <div>
                            <div className="text-xs font-semibold text-indigo-700 truncate">{a.rehab.phase}</div>
                            <div className="text-[10px] text-gray-400">Day {a.rehab.daysIn}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300">—</span>
                        )}
                      </div>

                      {/* Data freshness */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${freshDot}`} />
                        <span className="text-xs text-gray-500 truncate">{freshLabel}</span>
                      </div>

                      {/* Team */}
                      <div className="text-xs text-gray-600 font-medium truncate">{a.team}</div>

                      {/* Assigned to */}
                      <div className="text-xs text-gray-600 truncate">{a.assignedUserName ?? "—"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-400 font-medium">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${p === safePage ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage === pageCount}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VP Summary table ── */}
      {view === "vp" && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">VP Summary</h2>
              <p className="text-xs text-gray-400 mt-0.5">Simplified athlete overview — {filtered.length} athletes</p>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[220px_130px_110px_110px_140px_1fr] gap-x-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <ColHead>Athlete</ColHead>
            <ColHead>Position</ColHead>
            <ColHead>Status</ColHead>
            <ColHead>Medical</ColHead>
            <ColHead>Team</ColHead>
            <ColHead>Assigned to</ColHead>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">No athletes match your filters.</div>
            ) : filtered.map((a) => {
              const aCol = avatarColor(a.name);
              return (
                <div key={a.id} className="grid grid-cols-[220px_130px_110px_110px_140px_1fr] gap-x-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 ${aCol}`}>
                      {initials(a.name)}
                    </div>
                    <div className="text-sm font-bold text-gray-900 truncate">{a.name}</div>
                  </div>
                  <div className="text-xs text-gray-600 font-medium truncate">{a.position}</div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2 py-0.5 rounded-full ${STATUS_CFG[a.status].bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[a.status].dot}`} />
                      {STATUS_CFG[a.status].label}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-block text-[11px] font-bold border px-2 py-0.5 rounded-full ${MEDICAL_CFG[a.medical].bg}`}>
                      {MEDICAL_CFG[a.medical].label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-medium truncate">{a.team}</div>
                  <div className="text-xs text-gray-600 truncate">{a.assignedUserName ?? "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawer (also accessible from within the section) */}
      <AddAthleteDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSaved={() => {}}
      />
    </div>
  );
}
