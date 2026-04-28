"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { umsApi } from "@/lib/api";

interface TeamMember {
  id: number;
  name: string | null;
  email: string;
  roles: string[];
}

const STANDARD_POSITIONS = [
  "Goalkeeper", "Centre-Back", "Full-Back", "Midfielder",
  "Attacking Midfielder", "Winger", "Centre-Forward", "Striker",
];
const TEAMS = ["First Team", "Reserve Squad", "Rehab Group", "Academy"];
const STAFF_ROLES = [
  "Director of Performance",
  "Head Athletic Trainer",
  "Sports Science Lead",
  "Rehab Lead",
  "Team Physician",
];

interface AddAthleteDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">{children}</h3>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AddAthleteDrawer({ open, onClose, onSaved }: AddAthleteDrawerProps) {
  const [name, setName]                 = useState("");
  const [positionSelect, setPositionSelect] = useState("");
  const [customPosition, setCustomPosition] = useState("");
  const [dob, setDob]                   = useState("");
  const [team, setTeam]                 = useState("");
  const [medical, setMedical]           = useState<"cleared" | "limited" | "hold" | "">("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [files, setFiles]               = useState<File[]>([]);
  const [dragging, setDragging]         = useState(false);
  const [staffAssignment, setStaffAssignment] = useState<Record<string, number | "">>({});
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ["org-users"],
    queryFn: umsApi.getUsers,
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    setName(""); setPositionSelect(""); setCustomPosition(""); setDob(""); setTeam("");
    setMedical(""); setMedicalNotes(""); setFiles([]); setStaffAssignment({}); setError("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function usersForRole(role: string) {
    return members.filter((m) => m.roles.includes(role));
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const allowed = Array.from(incoming).filter((f) =>
      f.type === "application/pdf" || f.type === "text/csv" || f.name.endsWith(".csv")
    );
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...allowed.filter((f) => !existing.has(f.name + f.size))];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError("");
    if (!name.trim()) return setError("Athlete name is required.");
    const pos = positionSelect === "Custom" ? customPosition.trim() : positionSelect;
    if (!pos) return setError("Position is required.");
    if (!team) return setError("Please assign a team.");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    onSaved();
    onClose();
  }

  const fi  = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";
  const sel = fi + " appearance-none cursor-pointer pr-9";

  const MEDICAL_OPTS = [
    { value: "cleared", label: "Cleared",  cls: "border-green-500 bg-green-50 text-green-700" },
    { value: "limited", label: "Limited",  cls: "border-amber-500 bg-amber-50 text-amber-700" },
    { value: "hold",    label: "Hold",     cls: "border-red-400 bg-red-50 text-red-700"       },
  ] as const;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}

      <div className={`fixed top-0 right-0 h-full w-[500px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Add Athlete</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fields marked * are required</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Identity ── */}
          <div>
            <SectionTitle>Identity</SectionTitle>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Full name <span className="text-orange-500">*</span></label>
                <input type="text" placeholder="e.g. Jordan Ellis" value={name} onChange={(e) => setName(e.target.value)} className={fi} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Position <span className="text-orange-500">*</span></label>
                  <div className="relative">
                    <select value={positionSelect} onChange={(e) => setPositionSelect(e.target.value)} className={sel}>
                      <option value="">Select…</option>
                      {STANDARD_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      <option value="Custom">Custom…</option>
                    </select>
                    <ChevronDown />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Date of birth</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={fi} />
                </div>
              </div>

              {positionSelect === "Custom" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Custom position <span className="text-orange-500">*</span></label>
                  <input type="text" placeholder="e.g. Libero, Sweeper…" value={customPosition} onChange={(e) => setCustomPosition(e.target.value)} className={fi} autoFocus />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Medical Details ── */}
          <div>
            <SectionTitle>Medical Details</SectionTitle>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Medical status</label>
                <div className="flex gap-2">
                  {MEDICAL_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMedical((prev) => prev === opt.value ? "" : opt.value)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        medical === opt.value ? opt.cls : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Medical notes</label>
                <textarea
                  rows={3}
                  placeholder="Known conditions, injury history, restrictions…"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className={fi + " resize-none"}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Medical Documents ── */}
          <div>
            <SectionTitle>Medical Documents</SectionTitle>
            <p className="text-[10px] text-gray-400 -mt-2 mb-3">Upload PDF or CSV files — multiple files supported</p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl px-5 py-7 text-center cursor-pointer transition-all ${
                dragging ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-xs font-semibold text-gray-500">Drop files here or <span className="text-orange-500">browse</span></p>
              <p className="text-[10px] text-gray-400 mt-1">PDF · CSV · Multiple files allowed</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => {
                  const isPdf = file.name.endsWith(".pdf");
                  return (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${isPdf ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {isPdf ? "PDF" : "CSV"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-800 truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-400">{formatBytes(file.size)}</div>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-1 text-gray-400 hover:text-red-500 transition shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Team & Staff Assignment ── */}
          <div>
            <SectionTitle>Team & Staff Assignment</SectionTitle>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Team <span className="text-orange-500">*</span></label>
                <div className="relative">
                  <select value={team} onChange={(e) => setTeam(e.target.value)} className={sel}>
                    <option value="">Assign to team…</option>
                    {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {STAFF_ROLES.map((role) => {
                const users = usersForRole(role);
                return (
                  <div key={role}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{role}</label>
                    <div className="relative">
                      <select
                        value={staffAssignment[role] ?? ""}
                        disabled={users.length === 0}
                        onChange={(e) => setStaffAssignment((prev) => ({
                          ...prev,
                          [role]: e.target.value === "" ? "" : Number(e.target.value),
                        }))}
                        className={sel + (users.length === 0 ? " opacity-40 cursor-not-allowed" : "")}
                      >
                        <option value="">{users.length === 0 ? "No users with this role" : "Select user…"}</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
                      </select>
                      <ChevronDown />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between gap-3">
          <span className="text-[10px] text-gray-400">
            {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} attached` : "Team updates performance data via integrations"}
          </span>
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold transition shadow-lg shadow-orange-200 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Adding…
                </>
              ) : "Add Athlete →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
