"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { umsApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgRole {
  id: number;
  name: string;
  organizationId: number | null;
  permissions: string[];
}

interface TeamMember {
  id: number;
  name: string | null;
  email: string;
  isActive: boolean;
  roles: string[];
  phone?: string;
  username?: string;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_MEMBERS: TeamMember[] = [
  { id: 100, name: "Marcus Okafor",     email: "m.okafor@apexfc.io",   phone: "+1 (415) 234-5678", username: "mokafor",   isActive: true,  roles: ["Director of Performance"]  },
  { id: 101, name: "Dr. Sarah Chen",    email: "s.chen@apexfc.io",     phone: "+1 (415) 345-6789", username: "schen",     isActive: true,  roles: ["Team Physician"]            },
  { id: 102, name: "James Torres",      email: "j.torres@apexfc.io",   phone: "+1 (415) 456-7890", username: "jtorres",   isActive: false, roles: ["Rehab Lead"]                },
  { id: 103, name: "Priya Nair",        email: "p.nair@apexfc.io",     phone: "+1 (415) 567-8901", username: "pnair",     isActive: true,  roles: ["Sports Science Lead"]       },
  { id: 104, name: "Coach R. Williams", email: "r.williams@apexfc.io", phone: "+1 (415) 678-9012", username: "rwilliams", isActive: true,  roles: ["Head Coach"]                },
  { id: 105, name: "Dr. Kim Singh",     email: "k.singh@apexfc.io",    phone: "+1 (415) 789-0123", username: "ksingh",    isActive: true,  roles: ["Head of Sports Medicine"]   },
  { id: 106, name: "Alex Rivera",       email: "a.rivera@apexfc.io",   phone: "+1 (415) 890-1234", username: "arivera",   isActive: false, roles: ["Head Athletic Trainer"]     },
  { id: 107, name: "Jordan Patel",      email: "j.patel@apexfc.io",    phone: "+1 (415) 901-2345", username: "jpatel",    isActive: true,  roles: ["Performance Director"]      },
];

const DEFAULT_ROLE_NAMES = [
  "Director of Performance",
  "Head Athletic Trainer",
  "Sports Science Lead",
  "Rehab Lead",
  "Team Physician",
  "Head Coach",
  "Performance Director",
  "Head of Sports Medicine",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  "Director of Performance":  "bg-orange-500 text-white border-orange-600",
  "Head Athletic Trainer":    "bg-blue-600 text-white border-blue-700",
  "Sports Science Lead":      "bg-purple-600 text-white border-purple-700",
  "Rehab Lead":               "bg-emerald-600 text-white border-emerald-700",
  "Team Physician":           "bg-rose-600 text-white border-rose-700",
  "Head Coach":               "bg-amber-500 text-white border-amber-600",
  "Performance Director":     "bg-indigo-600 text-white border-indigo-700",
  "Head of Sports Medicine":  "bg-teal-600 text-white border-teal-700",
};

function roleBadgeClass(name: string) {
  return ROLE_COLORS[name] ?? "bg-gray-700 text-white border-gray-800";
}

const AVATAR_PALETTE = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-sky-100 text-sky-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(name: string) {
  return AVATAR_PALETTE[(name.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
}

function initials(name: string | null, email: string) {
  if (!name) return email[0].toUpperCase();
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  roles: OrgRole[];
  onCreateRole: (name: string) => Promise<OrgRole>;
  editing?: TeamMember | null;
}

function UserModal({ open, onClose, onSaved, roles, onCreateRole, editing }: UserModalProps) {
  const isEdit = !!editing;

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [newRoleName, setNewRoleName]   = useState("");
  const [showNewRole, setShowNewRole]   = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name ?? "");
      setEmail(editing.email);
      setPhone(editing.phone ?? "");
      setUsername(editing.username ?? "");
      const matched = roles.find((r) => editing.roles.includes(r.name));
      setSelectedRole(matched?.id ?? "");
    } else {
      setName(""); setEmail(""); setPhone(""); setUsername("");
      setSelectedRole("");
    }
    setError(""); setShowNewRole(false); setNewRoleName("");
    setTimeout(() => nameRef.current?.focus(), 60);
  }, [open, editing, roles]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleCreateRole() {
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      const created = await onCreateRole(newRoleName.trim());
      setSelectedRole(created.id);
      setShowNewRole(false);
      setNewRoleName("");
    } catch {
      setError("Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  }

  async function handleSubmit() {
    setError("");
    if (!name.trim())  return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!selectedRole) return setError("Please select a role.");

    setSubmitting(true);
    try {
      const roleIds = [Number(selectedRole)];
      if (isEdit && editing) {
        await umsApi.updateUser(editing.id, { name: name.trim(), roleIds });
      } else {
        await umsApi.createUser({ name: name.trim(), email: email.trim(), password: "", roleIds });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const fi = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150";

  const displayName      = name.trim() || (isEdit ? (editing?.name ?? "New Member") : "New Member");
  const displayEmail     = email.trim() || (isEdit ? (editing?.email ?? "") : "");
  const selectedRoleName = roles.find((r) => r.id === selectedRole)?.name ?? "";
  const aColor           = avatarColor(displayName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={onClose} />

      {/* Modal: left preview + right form */}
      <div className="relative w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-2xl shadow-black/40" style={{ maxHeight: "92vh" }}>

        {/* ── LEFT: live preview ── */}
        <div className="w-60 shrink-0 bg-gray-900 flex flex-col relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-500/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-indigo-500/10 pointer-events-none" />

          {/* Profile card */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-4 relative z-10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl ${aColor}`}>
              {initials(name || null, displayEmail || "N")}
            </div>

            <div className="text-center px-2 space-y-1">
              <div className="text-white font-extrabold text-base leading-tight">{displayName}</div>
              {displayEmail && (
                <div className="text-gray-500 text-[11px] leading-snug break-all">{displayEmail}</div>
              )}
            </div>

            {selectedRoleName ? (
              <span className={`text-[11px] font-bold border px-3 py-1.5 rounded-full ${roleBadgeClass(selectedRoleName)}`}>
                {selectedRoleName}
              </span>
            ) : (
              <span className="text-[11px] text-gray-600 border border-gray-700 bg-gray-800 px-3 py-1.5 rounded-full font-medium">
                No role yet
              </span>
            )}

          </div>

          {/* Bottom label */}
          <div className="px-6 py-4 border-t border-white/5 shrink-0 relative z-10">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold text-center">
              {isEdit ? "Editing member" : "New member"}
            </p>
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-[15px] font-extrabold text-gray-900 leading-tight">
                {isEdit ? "Edit member details" : "Add new member"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEdit ? "Update the fields below" : "Fields marked * are required"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable fields */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

            {/* Name + Username */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Full name <span className="text-orange-500">*</span></label>
                </div>
                <input ref={nameRef} type="text" placeholder="James Torres" value={name} onChange={(e) => setName(e.target.value)} className={fi} />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Username</label>
                  <span className="text-[10px] text-gray-400">optional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none select-none">@</span>
                  <input type="text" placeholder="handle" value={username} onChange={(e) => setUsername(e.target.value)} className={fi + " pl-[2.1rem]"} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Work email <span className="text-orange-500">*</span>
              </label>
              <input type="email" placeholder="james@yourorg.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isEdit} className={fi} />
            </div>

            {/* Phone + Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Phone</label>
                  <span className="text-[10px] text-gray-400">optional</span>
                </div>
                <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={fi} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Role */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-xs font-semibold text-gray-600">Role <span className="text-orange-500">*</span></label>
                <button type="button" onClick={() => setShowNewRole((v) => !v)} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Custom role
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const sel = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                        sel ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        sel ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
                      }`}>
                        {sel && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </div>
                      <span className={`text-xs font-semibold leading-snug ${sel ? "text-orange-700" : "text-gray-700"}`}>
                        {role.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showNewRole && (
                <div className="flex gap-2 mt-3 p-3.5 bg-orange-50 border border-orange-100 rounded-xl">
                  <input
                    type="text"
                    placeholder="Custom role name…"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateRole())}
                    autoFocus
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-orange-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  />
                  <button type="button" onClick={handleCreateRole} disabled={!newRoleName.trim() || creatingRole} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition">
                    {creatingRole ? "…" : "Create"}
                  </button>
                  <button type="button" onClick={() => { setShowNewRole(false); setNewRoleName(""); }} className="px-3 py-2.5 text-gray-500 hover:bg-orange-100 rounded-lg transition text-xs font-semibold">✕</button>
                </div>
              )}
            </div>

            {/* Error */}
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
          <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between gap-3">
            <span className="text-[10px] text-gray-400 font-medium">
              {isEdit ? "Changes apply immediately" : "Member receives an invite email"}
            </span>
            <div className="flex gap-2.5">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {isEdit ? "Saving…" : "Adding…"}
                  </>
                ) : (
                  isEdit ? "Save changes" : "Add member →"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function TeamsSection() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd]             = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [search, setSearch]               = useState("");
  const [filterRole, setFilterRole]       = useState("all");
  const [page, setPage]                   = useState(1);
  const PAGE_SIZE = 5;

  const { data: apiMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["org-users"],
    queryFn: umsApi.getUsers,
    staleTime: 2 * 60_000,
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<OrgRole[]>({
    queryKey: ["org-roles"],
    queryFn: umsApi.getRoles,
    staleTime: 5 * 60_000,
  });

  const createRoleMutation = useMutation({
    mutationFn: (name: string) => umsApi.createRole({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["org-roles"] }),
  });

  function handleSaved() {
    queryClient.invalidateQueries({ queryKey: ["org-users"] });
  }

  async function handleCreateRole(name: string): Promise<OrgRole> {
    return createRoleMutation.mutateAsync(name);
  }

  const members: TeamMember[] = apiMembers.length > 0 ? apiMembers : DUMMY_MEMBERS;

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (m.name ?? "").toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone ?? "").includes(q) ||
      m.roles.some((r) => r.toLowerCase().includes(q));
    const matchRole = filterRole === "all" || m.roles.includes(filterRole);
    return matchSearch && matchRole;
  });

  const pageCount  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, pageCount);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goTo(p: number) { setPage(Math.max(1, Math.min(p, pageCount))); }
  function resetPage()     { setPage(1); }

  const defaultRolesForDisplay: OrgRole[] =
    roles.length > 0
      ? roles
      : DEFAULT_ROLE_NAMES.map((name, i) => ({ id: i + 1, name, organizationId: null, permissions: [] }));

  const allRoleNames = [...new Set(members.flatMap((m) => m.roles))].sort();

  const kpis = [
    { label: "Total members",  value: members.length,                            color: "text-white", accent: "bg-gray-800"    },
    { label: "Available",      value: members.filter((m) => m.isActive).length,  color: "text-white", accent: "bg-emerald-600" },
    { label: "Not available",  value: members.filter((m) => !m.isActive).length, color: "text-white", accent: "bg-orange-500"  },
    { label: "Roles assigned", value: allRoleNames.length,                       color: "text-white", accent: "bg-indigo-600"  },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50/60 overflow-y-auto">

      <div className="flex-1 px-8 py-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(({ label, value, color, accent }) => (
            <div key={label} className={`${accent} rounded-2xl px-5 py-4 shadow-sm`}>
              <div className={`text-3xl font-extrabold ${color} leading-none`}>{value}</div>
              <div className="text-xs font-semibold text-white/70 mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Add button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone, or role…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 placeholder-gray-400 text-gray-800 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); resetPage(); }}
              className="pl-4 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 appearance-none cursor-pointer shadow-sm text-gray-700 min-w-[150px]"
            >
              <option value="all">All roles</option>
              {allRoleNames.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          <button
            onClick={() => { setEditingMember(null); setShowAdd(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add user
          </button>
        </div>

        {/* Active filter chips */}
        {(filterRole !== "all" || search) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400">Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                &quot;{search}&quot;
                <button onClick={() => setSearch("")} className="ml-0.5 hover:text-orange-900">×</button>
              </span>
            )}
            {filterRole !== "all" && (
              <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {filterRole}
                <button onClick={() => setFilterRole("all")} className="ml-0.5 hover:text-orange-900">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setFilterRole("all"); resetPage(); }}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold underline ml-1"
            >
              Clear all
            </button>
            <span className="text-xs text-gray-400 ml-auto font-medium">
              {filtered.length} of {members.length} members
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

          {/* Column headers — 6 columns */}
          <div className="grid grid-cols-[2fr_1.6fr_2fr_1.2fr_1.8fr_120px] gap-x-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {["Member", "Role", "Email / Phone", "Status", "Edit details", "Actions"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{h}</span>
            ))}
          </div>

          {/* Skeleton */}
          {membersLoading && (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="grid grid-cols-[2fr_1.6fr_2fr_1.2fr_1.8fr_120px] gap-x-4 px-5 py-4 animate-pulse items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-28 bg-gray-100 rounded" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-36 bg-gray-100 rounded" />
                    <div className="h-2.5 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                    <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          {!membersLoading && (
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No members match your filters</p>
                  <button
                    onClick={() => { setSearch(""); setFilterRole("all"); }}
                    className="mt-3 text-xs font-bold text-orange-500 hover:text-orange-600"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {paginated.map((member) => {
                const primaryRole = member.roles[0] ?? "—";
                const aColor = avatarColor(member.name ?? member.email);

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-[2fr_1.6fr_2fr_1.2fr_1.8fr_120px] gap-x-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors items-center"
                  >
                    {/* Member */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${aColor}`}>
                        {initials(member.name, member.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{member.name ?? member.email.split("@")[0]}</div>
                        {member.username && (
                          <div className="text-[10px] text-gray-400">@{member.username}</div>
                        )}
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <span className={`inline-block text-[11px] font-bold border px-2.5 py-1 rounded-full ${roleBadgeClass(primaryRole)}`}>
                        {primaryRole}
                      </span>
                    </div>

                    {/* Email + Phone */}
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-600 truncate">{member.email}</div>
                      {member.phone && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{member.phone}</div>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Edit details — last-modified info */}
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 font-medium truncate">
                        {member.phone ? member.phone : <span className="text-gray-300 italic">No phone added</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {member.username ? `@${member.username}` : <span className="text-gray-300 italic">No username</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditingMember(member); setShowAdd(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                        Edit
                      </button>
                      <button
                        title={member.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!membersLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-400 font-medium">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      p === safePage
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage === pageCount}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <UserModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditingMember(null); }}
        onSaved={handleSaved}
        roles={defaultRolesForDisplay}
        onCreateRole={handleCreateRole}
        editing={editingMember}
      />
    </div>
  );
}
