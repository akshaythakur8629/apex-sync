"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { performanceApi, decisionsApi } from "@/lib/api";
import { CreateTeamModal } from "./CreateTeamModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RosterAthlete {
  id: string;
  name: string;
  medicalStatus: "cleared" | "limited" | "hold";
  hasConflict: boolean;
  dataGaps: string[];
}

interface Decision {
  id: number;
  status: string;
  escalation_level: number;
  created_at: string;
  athlete_id: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  athleteCount: number;
  lastActivity: string;
  status: "active" | "needs_attention";
}

// ─── Static demo teams ────────────────────────────────────────────────────────

const DEMO_TEAMS: Team[] = [
  { id: "t1", name: "First Team", description: "Senior squad", athleteCount: 28, lastActivity: "2 min ago", status: "active" },
  { id: "t2", name: "Reserve Squad", description: "Development & reserves", athleteCount: 22, lastActivity: "18 min ago", status: "needs_attention" },
  { id: "t3", name: "Rehab Group", description: "Return-to-play athletes", athleteCount: 5, lastActivity: "1 hour ago", status: "active" },
];

const DEMO_ACTIVITY = [
  { id: 1, icon: "⚠️", text: "Conflict detected for Jordan Ellis — high load vs. low wellness", time: "4 min ago", type: "conflict" },
  { id: 2, icon: "✅", text: "Decision resolved by Medical Lead for Marcus Webb", time: "22 min ago", type: "resolved" },
  { id: 3, icon: "📋", text: "Rationale captured for Theo Nakamura RTP decision", time: "1 hour ago", type: "rationale" },
  { id: 4, icon: "🔔", text: "Escalation triggered — Piers Lawton decision overdue 4h", time: "2 hours ago", type: "escalation" },
  { id: 5, icon: "👤", text: "New team member J. Torres invited as Rehab / RTP Lead", time: "3 hours ago", type: "user" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  subColor = "text-green-500",
  iconBg,
  iconPath,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  iconBg: string;
  iconPath: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-shadow">
      {loading ? (
        <div className="animate-pulse">
          <div className="w-10 h-10 bg-gray-100 rounded-full mb-4" />
          <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
          <div className="h-7 w-12 bg-gray-100 rounded" />
        </div>
      ) : (
        <>
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          </div>
          <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900 leading-none">{value}</div>
          {sub && <div className={`text-[11px] font-medium mt-1.5 ${subColor}`}>{sub}</div>}
        </>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "needs_attention" }) {
  return status === "active" ? (
    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
      Active
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
      Needs attention
    </span>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {action}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Overview() {
  const [teams, setTeams] = useState<Team[]>(DEMO_TEAMS);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const { data: roster = [], isLoading: rosterLoading } = useQuery<RosterAthlete[]>({
    queryKey: ["roster"],
    queryFn: performanceApi.getRoster,
    staleTime: 60_000,
  });

  const { data: openDecisions = [], isLoading: decisionsLoading } = useQuery<Decision[]>({
    queryKey: ["decisions-open"],
    queryFn: decisionsApi.getOpen,
    staleTime: 60_000,
  });

  const isLoading = rosterLoading || decisionsLoading;

  const kpis = {
    totalTeams: teams.length,
    activeDecisions: openDecisions.length,
    pendingEscalations: openDecisions.filter((d) => d.escalation_level > 0).length,
    dataCompleteness:
      roster.length === 0
        ? 100
        : Math.round((roster.filter((a) => a.dataGaps.length === 0).length / roster.length) * 100),
  };

  const alerts = [
    ...roster
      .filter((a) => a.hasConflict)
      .map((a) => ({
        id: `conflict-${a.id}`,
        type: "conflict" as const,
        message: `Conflict detected for ${a.name} — signals disagree across domains`,
      })),
    ...roster
      .filter((a) => a.dataGaps.length > 0)
      .map((a) => ({
        id: `gap-${a.id}`,
        type: "gap" as const,
        message: `${a.name} — ${a.dataGaps[0]}`,
      })),
    ...openDecisions
      .filter((d) => d.escalation_level > 0)
      .map((d) => ({
        id: `esc-${d.id}`,
        type: "escalation" as const,
        message: `Decision #${d.id} escalated (level ${d.escalation_level})`,
      })),
  ];

  function handleTeamCreated(team: { name: string; description: string }) {
    const newTeam: Team = {
      id: `t${Date.now()}`,
      name: team.name,
      description: team.description || "New team",
      athleteCount: 0,
      lastActivity: "Just now",
      status: "active",
    };
    setTeams((prev) => [...prev, newTeam]);
  }

  return (
    <div className="max-w-6xl mx-auto px-8 pb-8 space-y-6">
      {/* ── A. KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total teams"
          value={kpis.totalTeams}
          sub="Across all programmes"
          subColor="text-gray-400"
          iconBg="bg-purple-500"
          iconPath="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          loading={false}
        />
        <KPICard
          label="Active decisions"
          value={kpis.activeDecisions}
          sub="Awaiting resolution"
          subColor="text-orange-500"
          iconBg="bg-orange-500"
          iconPath="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
          loading={isLoading}
        />
        <KPICard
          label="Pending escalations"
          value={kpis.pendingEscalations}
          sub={kpis.pendingEscalations > 0 ? "Requires immediate review" : "All within deadline"}
          subColor={kpis.pendingEscalations > 0 ? "text-red-500" : "text-green-500"}
          iconBg={kpis.pendingEscalations > 0 ? "bg-red-500" : "bg-blue-500"}
          iconPath="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
          loading={isLoading}
        />
        <KPICard
          label="Data completeness"
          value={`${kpis.dataCompleteness}%`}
          sub={kpis.dataCompleteness < 90 ? "Below 90% threshold" : "Above target"}
          subColor={kpis.dataCompleteness < 90 ? "text-amber-500" : "text-green-500"}
          iconBg={kpis.dataCompleteness < 90 ? "bg-amber-400" : "bg-green-500"}
          iconPath="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={rosterLoading}
        />
      </div>

      {/* ── B. Teams Section ── */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Teams</h2>
            <p className="text-xs text-gray-400 mt-0.5">{teams.length} active team{teams.length !== 1 ? "s" : ""} in your organisation</p>
          </div>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create team
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Team</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Athletes</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Last activity</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50/50 transition group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{team.name}</div>
                      <div className="text-[10px] text-gray-400">{team.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-gray-700 font-medium">{team.athleteCount}</span>
                  <span className="text-xs text-gray-400 ml-1">athletes</span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-xs text-gray-500">{team.lastActivity}</span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusDot status={team.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition">
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-gray-400">No teams yet</div>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="mt-2 text-xs text-orange-500 font-semibold hover:underline"
            >
              Create your first team
            </button>
          </div>
        )}
      </div>

      {/* ── C + D. Activity + Alerts ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">Recent activity</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest decisions, conflicts, and changes</p>
          </div>
          <div className="divide-y divide-gray-50">
            {DEMO_ACTIVITY.map((item) => (
              <div key={item.id} className="flex gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition">
                <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Alerts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Items requiring human review</p>
            </div>
            {alerts.length > 0 && (
              <span className="text-[10px] font-bold bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {alerts.length} open
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {rosterLoading ? (
              <div className="px-5 py-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2.5 h-2.5 bg-gray-100 rounded-full mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <svg className="w-8 h-8 text-green-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-400">No active alerts</div>
                <div className="text-[10px] text-gray-400 mt-0.5">All signals are within normal range</div>
              </div>
            ) : (
              alerts.map((alert) => {
                const config = {
                  conflict: { dot: "bg-amber-400", bg: "hover:bg-amber-50/30", badge: "bg-amber-50 text-amber-600 border-amber-100", label: "Conflict" },
                  gap: { dot: "bg-gray-400", bg: "hover:bg-gray-50/30", badge: "bg-gray-50 text-gray-500 border-gray-200", label: "Data gap" },
                  escalation: { dot: "bg-red-400", bg: "hover:bg-red-50/30", badge: "bg-red-50 text-red-600 border-red-100", label: "Escalation" },
                }[alert.type];

                return (
                  <div key={alert.id} className={`flex items-start gap-3 px-5 py-3.5 transition ${config.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${config.dot} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{alert.message}</p>
                      <span className={`inline-block mt-1 text-[10px] font-medium border px-1.5 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 italic shrink-0 mt-0.5">Review</span>
                  </div>
                );
              })
            )}
          </div>

          {alerts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 italic text-center">
                All alerts require human review. ApexSync does not generate clinical recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal
        open={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onCreated={handleTeamCreated}
      />
    </div>
  );
}
