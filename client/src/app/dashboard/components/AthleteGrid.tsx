"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { performanceApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Athlete {
  id: string;
  name: string;
  position: string;
  medicalStatus: "cleared" | "limited" | "hold";
  loadScore: number;
  wellnessScore: number;
  hasConflict: boolean;
  conflictDetail?: string;
  dataGaps: string[];
  lastUpdated: string;
  owner?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  cleared: { label: "Cleared", dot: "bg-green-400", badge: "bg-green-50 text-green-700 border-green-100" },
  limited: { label: "Limited", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-100" },
  hold: { label: "Hold", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

function ConflictBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Conflict detected
    </div>
  );
}

function DataGapBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {label}
    </div>
  );
}

function AthleteCard({ athlete }: { athlete: Athlete }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[athlete.medicalStatus];

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${
        athlete.hasConflict ? "border-amber-200" : "border-gray-100"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
              {athlete.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{athlete.name}</div>
              <div className="text-xs text-gray-400">{athlete.position || "—"}</div>
            </div>
          </div>
          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
            {statusCfg.label}
          </span>
        </div>

        <div className="space-y-2.5 mb-3">
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Load score</span>
              <span className="font-medium text-gray-600">{athlete.loadScore}</span>
            </div>
            <ScoreBar value={athlete.loadScore} color="bg-blue-400" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Wellness</span>
              <span className="font-medium text-gray-600">{athlete.wellnessScore}</span>
            </div>
            <ScoreBar
              value={athlete.wellnessScore}
              color={athlete.wellnessScore < 60 ? "bg-amber-400" : "bg-green-400"}
            />
          </div>
        </div>

        {athlete.hasConflict && (
          <div className="mb-3">
            <ConflictBadge />
          </div>
        )}

        {athlete.dataGaps.map((gap) => (
          <div key={gap} className="mb-2">
            <DataGapBadge label={gap} />
          </div>
        ))}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-[10px] text-gray-400">Updated {athlete.lastUpdated}</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 transition"
          >
            {expanded ? "Hide brief ↑" : "View brief ↓"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Decision Brief</div>

          {athlete.hasConflict && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Conflict detected</div>
              <p className="text-xs text-amber-700">
                {athlete.conflictDetail ?? "Signals disagree across domains. Requires human review."}
              </p>
              <p className="text-[10px] text-amber-500 mt-1">For human judgment — this is not a recommendation.</p>
            </div>
          )}

          {athlete.dataGaps.length > 0 && (
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data gaps</div>
              {athlete.dataGaps.map((gap) => (
                <p key={gap} className="text-xs text-gray-600">• {gap}</p>
              ))}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Ownership</div>
            <p className="text-xs text-gray-700">
              Assigned to: <span className="font-semibold">{athlete.owner ?? "Unassigned"}</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Confidence:{" "}
              {athlete.dataGaps.length > 0
                ? "Low — data gaps present"
                : athlete.hasConflict
                ? "Medium — conflict requires resolution"
                : "High"}
            </p>
          </div>

          <p className="text-[10px] text-gray-400 italic">
            Data signals suggest current status based on available sources. All inputs require human review before any decision is made.
          </p>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div>
            <div className="h-3.5 w-28 bg-gray-100 rounded mb-1.5" />
            <div className="h-2.5 w-10 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-1.5 bg-gray-100 rounded-full" />
        <div className="h-1.5 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AthleteGrid() {
  const { data: athletes = [], isLoading, isError, error } = useQuery<Athlete[]>({
    queryKey: ["roster"],
    queryFn: performanceApi.getRoster,
    staleTime: 60_000,
  });

  const conflicts = athletes.filter((a) => a.hasConflict).length;
  const dataGaps = athletes.filter((a) => a.dataGaps.length > 0).length;
  const cleared = athletes.filter((a) => a.medicalStatus === "cleared").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Athlete Status</h1>
          <p className="text-sm text-gray-400 mt-0.5">Unified view across all connected sources</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Live — refreshes within 15 min
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total athletes", value: String(athletes.length), color: "text-gray-900" },
            { label: "Cleared", value: String(cleared), color: "text-green-600" },
            { label: "Conflict alerts", value: String(conflicts), color: "text-amber-600" },
            { label: "Data gaps", value: String(dataGaps), color: "text-gray-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Conflict banner */}
      {!isLoading && conflicts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <span className="text-sm font-semibold text-amber-800">
              {conflicts} conflict{conflicts > 1 ? "s" : ""} detected
            </span>
            <span className="text-sm text-amber-700">
              {" "}— signals disagree across domains for{" "}
              {athletes.filter((a) => a.hasConflict).map((a) => a.name).join(", ")}. Human review required.
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-6 mb-6 text-center">
          <svg className="w-8 h-8 text-red-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="text-sm font-semibold text-red-700 mb-1">Failed to load athlete roster</div>
          <div className="text-xs text-red-500">{(error as Error)?.message ?? "Please check your connection and try again."}</div>
        </div>
      )}

      {/* Athlete grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : athletes.map((athlete) => <AthleteCard key={athlete.id} athlete={athlete} />)}
      </div>

      {!isLoading && !isError && athletes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-sm text-gray-400">No athletes in the roster yet.</div>
          <div className="text-xs text-gray-400 mt-1">Connect a data source to begin ingesting athlete data.</div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-8">
        All data signals are for human review only. ApexSync does not generate clinical assessments or clearance recommendations.
      </p>
    </div>
  );
}
