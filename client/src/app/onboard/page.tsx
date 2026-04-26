"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrgType = "professional" | "national_federation" | "collegiate";
type Sport = "football" | "rugby" | "basketball" | "soccer" | "hockey" | "other";
type StaffRole =
  | "director_of_performance"
  | "head_athletic_trainer"
  | "rehab_rtp_lead"
  | "sports_science_lead";

interface DataSource {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface StaffInvite {
  id: string;
  email: string;
  role: StaffRole;
}

interface OrgFormState {
  orgName: string;
  orgType: OrgType | "";
  sport: Sport | "";
  region: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  dataSources: DataSource[];
  staffInvites: StaffInvite[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ORG_TYPES: { value: OrgType; label: string; sub: string }[] = [
  { value: "professional", label: "Professional League", sub: "NFL, Premier League, NBA, etc." },
  { value: "national_federation", label: "National Federation", sub: "Olympic bodies, national governing orgs" },
  { value: "collegiate", label: "Collegiate Program", sub: "NCAA, university athletics departments" },
];

const SPORTS: { value: Sport; label: string }[] = [
  { value: "football", label: "American Football" },
  { value: "rugby", label: "Rugby" },
  { value: "basketball", label: "Basketball" },
  { value: "soccer", label: "Soccer / Football" },
  { value: "hockey", label: "Ice Hockey" },
  { value: "other", label: "Other" },
];

const ROLE_LABELS: Record<StaffRole, string> = {
  director_of_performance: "Director of Performance",
  head_athletic_trainer: "Head Athletic Trainer",
  rehab_rtp_lead: "Rehab / RTP Lead",
  sports_science_lead: "Sports Science Lead",
};

const ROLE_ID_MAP: Record<StaffRole, number> = {
  director_of_performance: 1,
  head_athletic_trainer: 2,
  rehab_rtp_lead: 3,
  sports_science_lead: 4,
};

const INITIAL_DATA_SOURCES: DataSource[] = [
  {
    id: "catapult",
    name: "Catapult",
    description: "GPS tracking, load monitoring, movement data",
    category: "Load & GPS",
    enabled: false,
  },
  {
    id: "kitman",
    name: "Kitman Labs",
    description: "Medical records, injury tracking, wellness surveys",
    category: "Medical & Wellness",
    enabled: false,
  },
  {
    id: "whoop",
    name: "WHOOP",
    description: "Recovery, strain, sleep, HRV data",
    category: "Recovery",
    enabled: false,
  },
  {
    id: "emr",
    name: "Proprietary EMR",
    description: "Organisation-specific electronic medical records",
    category: "Medical",
    enabled: false,
  },
  {
    id: "other",
    name: "Other / Custom",
    description: "CSV exports, internal databases, custom integrations",
    category: "Custom",
    enabled: false,
  },
];

const TOTAL_STEPS = 5;

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  const labels = ["Organisation", "Admin account", "Data sources", "Invite staff", "Review"];
  return (
    <div className="flex items-center gap-0 mb-10">
      {labels.map((label, idx) => {
        const step = idx + 1;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? "bg-gray-900 text-white"
                    : active
                    ? "bg-orange-500 text-white shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  active ? "text-orange-600" : done ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < labels.length - 1 && (
              <div className="flex-1 h-px mx-2 bg-gray-200 mb-4">
                <div
                  className="h-full bg-gray-900 transition-all duration-500"
                  style={{ width: current > step ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{children}</label>
  );
}

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
    />
  );
}

// ─── Step 1: Organisation Profile ────────────────────────────────────────────

function Step1({
  state,
  onChange,
  onNext,
  checkingOrg,
  orgError,
  onCheckOrg,
}: {
  state: OrgFormState;
  onChange: (patch: Partial<OrgFormState>) => void;
  onNext: () => void;
  checkingOrg?: boolean;
  orgError?: string;
  onCheckOrg: (name: string) => void;
}) {
  const [lastChecked, setLastChecked] = useState("");
  const valid = state.orgName.trim() && state.orgType && state.sport && !orgError;

  // 2s debounce for org name check
  useEffect(() => {
    const name = state.orgName.trim();
    if (!name || name === lastChecked) return;
    
    const timer = setTimeout(() => {
      onCheckOrg(name);
      setLastChecked(name);
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.orgName, lastChecked, onCheckOrg]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext();
      }}
      className="space-y-5"
    >
      <div>
        <FieldLabel>Organisation name *</FieldLabel>
        <div className="relative">
          <Input
            placeholder="e.g. Apex FC, Ridgeline Athletic"
            value={state.orgName}
            onChange={(v) => onChange({ orgName: v })}
            required
          />
          {checkingOrg && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>
        {orgError && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2 flex items-center gap-2 animate-shake">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-xs text-red-600 font-medium">{orgError}</p>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Organisation type *</FieldLabel>
        <div className="grid gap-2">
          {ORG_TYPES.map(({ value, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ orgType: value })}
              className={`text-left px-4 py-3 rounded-xl border transition ${
                state.orgType === value
                  ? "border-orange-400 bg-orange-50 ring-2 ring-orange-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-semibold text-gray-800">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Sport *</FieldLabel>
          <select
            value={state.sport}
            onChange={(e) => onChange({ sport: e.target.value as Sport })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white"
          >
            <option value="">Select sport</option>
            {SPORTS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Region / Country</FieldLabel>
          <Input
            placeholder="e.g. United States"
            value={state.region}
            onChange={(v) => onChange({ region: v })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid || checkingOrg}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        {checkingOrg ? "Checking name..." : "Continue →"}
      </button>
    </form>
  );
}

// ─── Step 2: Admin Account ────────────────────────────────────────────────────

function Step2({
  state,
  onChange,
  onNext,
  onBack,
}: {
  state: OrgFormState;
  onChange: (patch: Partial<OrgFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const valid =
    state.adminFirstName.trim() &&
    state.adminLastName.trim() &&
    state.adminEmail.trim() &&
    state.adminPassword.length >= 8 &&
    state.adminPassword === state.adminPasswordConfirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.adminPassword !== state.adminPasswordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (state.adminPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>First name *</FieldLabel>
          <Input
            placeholder="First name"
            value={state.adminFirstName}
            onChange={(v) => onChange({ adminFirstName: v })}
            required
          />
        </div>
        <div>
          <FieldLabel>Last name *</FieldLabel>
          <Input
            placeholder="Last name"
            value={state.adminLastName}
            onChange={(v) => onChange({ adminLastName: v })}
            required
          />
        </div>
      </div>

      <div>
        <FieldLabel>Work email *</FieldLabel>
        <Input
          type="email"
          placeholder="you@yourorg.com"
          value={state.adminEmail}
          onChange={(v) => onChange({ adminEmail: v })}
          required
        />
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-orange-700">
        You will be registered as <strong>Director of Performance</strong> — the primary admin for your organisation. Additional roles can be invited in the next step.
      </div>

      <div>
        <FieldLabel>Password *</FieldLabel>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            placeholder="At least 8 characters"
            value={state.adminPassword}
            onChange={(e) => onChange({ adminPassword: e.target.value })}
            required
            className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        {state.adminPassword && state.adminPassword.length < 8 && (
          <p className="text-xs text-red-500 mt-1">Minimum 8 characters</p>
        )}
      </div>

      <div>
        <FieldLabel>Confirm password *</FieldLabel>
        <Input
          type="password"
          placeholder="Repeat password"
          value={state.adminPasswordConfirm}
          onChange={(v) => onChange({ adminPasswordConfirm: v })}
          required
        />
        {state.adminPasswordConfirm && state.adminPassword !== state.adminPasswordConfirm && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!valid}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        Continue →
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
        ← Back
      </button>
    </form>
  );
}

// ─── Step 3: Data Sources ─────────────────────────────────────────────────────

function Step3({
  state,
  onChange,
  onNext,
  onBack,
}: {
  state: OrgFormState;
  onChange: (patch: Partial<OrgFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  function toggleSource(id: string) {
    onChange({
      dataSources: state.dataSources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    });
  }

  const anyEnabled = state.dataSources.some((s) => s.enabled);

  const categoryColors: Record<string, string> = {
    "Load & GPS": "bg-blue-50 text-blue-600",
    "Medical & Wellness": "bg-green-50 text-green-700",
    Recovery: "bg-purple-50 text-purple-600",
    Medical: "bg-red-50 text-red-600",
    Custom: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Select the data sources your organisation currently uses. You can connect and configure each integration after setup. At least one source is recommended.
      </p>

      <div className="space-y-3">
        {state.dataSources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => toggleSource(source.id)}
            className={`w-full text-left px-4 py-4 rounded-xl border transition ${
              source.enabled
                ? "border-orange-400 bg-orange-50 ring-2 ring-orange-400"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                    source.enabled ? "bg-orange-500 border-orange-500" : "border-gray-300"
                  }`}
                >
                  {source.enabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{source.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{source.description}</div>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${categoryColors[source.category]}`}>
                {source.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {!anyEnabled && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          No data sources selected. ApexSync requires at least one connected source to surface athlete readiness signals. You can connect sources after setup.
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        Continue →
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
        ← Back
      </button>
    </div>
  );
}

// ─── Step 4: Invite Staff ─────────────────────────────────────────────────────

function Step4({
  state,
  onChange,
  onNext,
  onBack,
}: {
  state: OrgFormState;
  onChange: (patch: Partial<OrgFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("head_athletic_trainer");
  const [emailError, setEmailError] = useState("");

  function addInvite() {
    if (!newEmail.trim()) return;
    if (newEmail === state.adminEmail) {
      setEmailError("This is your admin account email.");
      return;
    }
    if (state.staffInvites.some((i) => i.email === newEmail)) {
      setEmailError("Already added.");
      return;
    }
    setEmailError("");
    onChange({
      staffInvites: [
        ...state.staffInvites,
        { id: crypto.randomUUID(), email: newEmail.trim(), role: newRole },
      ],
    });
    setNewEmail("");
    setNewRole("head_athletic_trainer");
  }

  function removeInvite(id: string) {
    onChange({ staffInvites: state.staffInvites.filter((i) => i.id !== id) });
  }

  const roleBadgeColor: Record<StaffRole, string> = {
    director_of_performance: "bg-orange-50 text-orange-600",
    head_athletic_trainer: "bg-blue-50 text-blue-600",
    rehab_rtp_lead: "bg-green-50 text-green-700",
    sports_science_lead: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Invite your multi-disciplinary staff team. Each member will receive an email with login instructions. You can add more members after setup.
      </p>

      {/* Admin pre-filled */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
          {state.adminFirstName?.[0] ?? "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800">
            {state.adminFirstName} {state.adminLastName}
          </div>
          <div className="text-xs text-gray-400 truncate">{state.adminEmail}</div>
        </div>
        <span className="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full shrink-0">
          Director of Performance
        </span>
        <span className="text-[10px] text-gray-400 shrink-0">You</span>
      </div>

      {/* Existing invites */}
      {state.staffInvites.map((invite) => (
        <div key={invite.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
            {invite.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 truncate">{invite.email}</div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadgeColor[invite.role]}`}>
            {ROLE_LABELS[invite.role]}
          </span>
          <button
            type="button"
            onClick={() => removeInvite(invite.id)}
            className="text-gray-300 hover:text-red-400 transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Add invite row */}
      <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add team member</div>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInvite())}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as StaffRole)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition"
          >
            {(Object.entries(ROLE_LABELS) as [StaffRole, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addInvite}
            disabled={!newEmail.trim()}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
          >
            Add
          </button>
        </div>
        {emailError && <p className="text-xs text-red-500">{emailError}</p>}
      </div>

      {state.staffInvites.length === 0 && (
        <p className="text-xs text-gray-400 text-center">No staff added yet — you can invite members after setup.</p>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        Continue →
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
        ← Back
      </button>
    </div>
  );
}

// ─── Step 5: Review & Launch ──────────────────────────────────────────────────

function Step5({
  state,
  onLaunch,
  onBack,
  launching,
  error,
}: {
  state: OrgFormState;
  onLaunch: () => void;
  onBack: () => void;
  launching: boolean;
  error?: string;
}) {
  const orgTypeLabel = ORG_TYPES.find((o) => o.value === state.orgType)?.label ?? state.orgType;
  const sportLabel = SPORTS.find((s) => s.value === state.sport)?.label ?? state.sport;
  const enabledSources = state.dataSources.filter((s) => s.enabled);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Review your organisation setup before launching your workspace. Everything can be updated after launch.
      </p>

      {/* Org */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Organisation</div>
        <Row label="Name" value={state.orgName} />
        <Row label="Type" value={orgTypeLabel} />
        <Row label="Sport" value={sportLabel} />
        {state.region && <Row label="Region" value={state.region} />}
      </div>

      {/* Admin */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin account</div>
        <Row label="Name" value={`${state.adminFirstName} ${state.adminLastName}`} />
        <Row label="Email" value={state.adminEmail} />
        <Row label="Role" value="Director of Performance" />
      </div>

      {/* Data sources */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Data sources</div>
        {enabledSources.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            No sources selected — connect after launch
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {enabledSources.map((s) => (
              <span key={s.id} className="text-xs font-medium bg-orange-50 border border-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Staff */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Staff invitations</div>
        {state.staffInvites.length === 0 ? (
          <p className="text-xs text-gray-400">No invitations — add staff after launch</p>
        ) : (
          <div className="space-y-1.5">
            {state.staffInvites.map((invite) => (
              <div key={invite.id} className="flex justify-between text-xs">
                <span className="text-gray-700">{invite.email}</span>
                <span className="text-gray-400">{ROLE_LABELS[invite.role]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2 animate-shake">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onLaunch}
        disabled={launching}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow"
      >
        {launching ? (
          <><Spinner /> Launching workspace…</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            Launch workspace
          </>
        )}
      </button>
      <button type="button" onClick={onBack} disabled={launching} className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
        ← Back
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

// ─── Step Headers ─────────────────────────────────────────────────────────────

const STEP_META = [
  { title: "Set up your organisation", desc: "Tell us about your sports organisation so we can configure your workspace." },
  { title: "Create your admin account", desc: "You'll be the primary admin — the Director of Performance for your org." },
  { title: "Connect your data sources", desc: "Select the tools your organisation uses. ApexSync integrates above these, not instead of them." },
  { title: "Invite your staff team", desc: "Add staff members by email and assign their roles. They'll receive login invitations." },
  { title: "Review & launch", desc: "Confirm your setup. Your workspace will be ready in seconds." },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const INITIAL_STATE: OrgFormState = {
  orgName: "",
  orgType: "",
  sport: "",
  region: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPassword: "",
  adminPasswordConfirm: "",
  dataSources: INITIAL_DATA_SOURCES,
  staffInvites: [],
};

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrgFormState>(INITIAL_STATE);

  const signupMutation = useMutation({
    mutationFn: (payload: any) => authApi.signup(payload),
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (err: any) => {
      console.error('Signup failed:', err);
    }
  });

  const checkOrgMutation = useMutation({
    mutationFn: (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '_');
      return authApi.checkOrg(slug);
    }
  });

  function patch(update: Partial<OrgFormState>) {
    setForm((prev) => ({ ...prev, ...update }));
  }

  async function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function launch() {
    const payload = {
      name: `${form.adminFirstName} ${form.adminLastName}`,
      email: form.adminEmail,
      password: form.adminPassword,
      orgName: form.orgName,
      orgType: form.orgType,
      sport: form.sport,
      region: form.region,
      config: {
        data_sources: form.dataSources.filter(s => s.enabled).map(s => s.id),
        timezone: "UTC"
      },
      invitedStaff: form.staffInvites.map(s => ({
        email: s.email,
        name: s.email.split('@')[0],
        roleId: ROLE_ID_MAP[s.role]
      }))
    };

    signupMutation.mutate(payload);
  }

  const meta = STEP_META[step - 1];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#e8ede3] p-12 flex-col justify-between relative overflow-hidden shrink-0">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm">ApexSync</span>
            <span className="text-[10px] font-medium text-orange-500 bg-orange-100 border border-orange-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">PMIS</span>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Your decision-intelligence workspace, configured for your organisation.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Takes under 5 minutes. Connect your data sources, invite your staff, and you&apos;re ready to make aligned, defensible readiness decisions.
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-4">
          {[
            { icon: "🔗", title: "Integrates above your existing stack", body: "Catapult, Kitman Labs, WHOOP, and your EMR — not instead of them." },
            { icon: "⚡", title: "Staff can be onboarded in minutes", body: "Role-based access. Everyone sees what they need, nothing they shouldn't." },
            { icon: "🔒", title: "Strict tenant isolation", body: "Your org's data never touches another org. Always." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="flex items-start gap-3 bg-white/60 rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">{icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{body}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-start justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">ApexSync PMIS</span>
          </div>

          <StepBar current={step} />

          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{meta.title}</h1>
            <p className="text-sm text-gray-500">{meta.desc}</p>
          </div>

          {step === 1 && (
            <Step1 
              state={form} 
              onChange={patch} 
              onNext={next} 
              checkingOrg={checkOrgMutation.isPending}
              orgError={checkOrgMutation.data?.exists ? "Organisation name already taken." : undefined}
              onCheckOrg={(name) => checkOrgMutation.mutate(name)}
            />
          )}
          {step === 2 && <Step2 state={form} onChange={patch} onNext={next} onBack={back} />}
          {step === 3 && <Step3 state={form} onChange={patch} onNext={next} onBack={back} />}
          {step === 4 && <Step4 state={form} onChange={patch} onNext={next} onBack={back} />}
          {step === 5 && (
            <Step5 
              state={form} 
              onLaunch={launch} 
              onBack={back} 
              launching={signupMutation.isPending} 
              error={(signupMutation.error as any)?.message} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
