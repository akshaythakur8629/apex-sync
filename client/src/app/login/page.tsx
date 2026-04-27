"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

const ORGANISATIONS = [
  { id: "apex-corp", name: "Apex Corp", domain: "apexcorp.io" },
  { id: "techventures", name: "TechVentures Inc", domain: "techventures.com" },
  { id: "globalsync", name: "GlobalSync Ltd", domain: "globalsync.net" },
  { id: "dataflow", name: "DataFlow Systems", domain: "dataflow.ai" },
  { id: "cloudbase", name: "CloudBase AI", domain: "cloudbase.dev" },
];

type Step = 1 | 2 | 3;

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {([1, 2, 3] as Step[]).map((s, idx) => (
        <div key={s} className="flex items-center">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                current > s
                  ? "bg-gray-900 text-white"
                  : current === s
                  ? "bg-orange-500 text-white shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {current > s ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
          </div>
          {idx < 2 && (
            <div className="w-16 h-px mx-1 relative overflow-hidden bg-gray-200">
              <div
                className="absolute inset-y-0 left-0 bg-gray-900 transition-all duration-500"
                style={{ width: current > s + 1 ? "100%" : current === s + 1 ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
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

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide leading-none mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-700 truncate">{value}</div>
      </div>
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    </div>
  );
}

function OrgDropdown({
  value,
  onChange,
  organisations,
}: {
  value: string;
  onChange: (v: string) => void;
  organisations: { id: number; name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = organisations?.find((o) => o.slug === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
          open ? "border-orange-400 ring-2 ring-orange-400" : "border-gray-200"
        } ${selected ? "text-gray-800" : "text-gray-400"}`}
      >
        {selected ? (
          <div>
            <div className="font-medium leading-none">{selected.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{selected.domain}</div>
          </div>
        ) : (
          <span>Select your organisation</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-in-up">
          {organisations.map((org) => (
            <button
              key={org.slug}
              type="button"
              onClick={() => { onChange(org.slug); setOpen(false); }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-orange-50 transition ${
                value === org.slug ? "bg-orange-50" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-600">{org.name[0]}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{org.name}</div>
                <div className="text-[11px] text-gray-400">{org.slug}.apexsync.io</div>
              </div>
              {value === org.slug && (
                <svg className="w-4 h-4 text-orange-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [orgId, setOrgId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [organisations, setOrganisations] = useState<{ id: number; name: string; slug: string }[]>([]);

  const checkEmailMutation = useMutation({
    mutationFn: (email: string) => authApi.checkEmail(email),
    onSuccess: (data) => {
      setOrganisations(data.organizations);
      advance(2);
    }
  });

  const loginMutation = useMutation({
    mutationFn: (payload: any) => authApi.login(payload),
    onSuccess: () => {
      router.push("/dashboard");
    }
  });

  const selectedOrg = organisations?.find((o) => o.slug === orgId);

  function advance(nextStep: Step) {
    setStep(nextStep);
    setAnimKey((k) => k + 1);
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!email || checkEmailMutation.isPending) return;
    checkEmailMutation.mutate(email);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    advance(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loginMutation.isPending) return;
    
    loginMutation.mutate({
      email,
      password,
      org_slug: orgId
    });
  }

  const stepMeta = [
    { label: "Your email", desc: "We'll find your workspace" },
    { label: "Select organisation", desc: "Choose your workspace" },
    { label: "Enter password", desc: "You're almost in" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[58%] bg-[#e8ede3] p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm">ApexSync</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight max-w-sm mb-4">
            The first sync platform for everyone with A.I.
          </h1>
          <p className="text-gray-500 text-base max-w-xs">
            Innovative software for AI-assisted workflow management
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="absolute bottom-0 left-8 right-0 bg-white rounded-tl-2xl rounded-tr-2xl shadow-2xl overflow-hidden" style={{ height: "62%" }}>
          <div className="flex border-b border-gray-100 px-4 py-3 items-center gap-3">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">A</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">ApexSync</span>
          </div>
          <div className="flex h-full">
            <div className="w-36 border-r border-gray-100 px-3 py-4 flex flex-col gap-1 shrink-0">
              <div className="bg-orange-500 rounded-md px-2 py-1.5 mb-1">
                <div className="h-2 w-14 bg-white/80 rounded-full" />
              </div>
              {["My bank", "My clients", "My store", "My analytics", "My experiences"].map((item) => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5">
                  <div className="w-3 h-3 rounded-full border border-gray-300" />
                  <div className="h-1.5 w-14 bg-gray-200 rounded-full" />
                </div>
              ))}
              <div className="mt-auto bg-gray-50 rounded-lg p-2 text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-1" />
                <div className="h-1.5 w-16 bg-gray-200 rounded-full mx-auto mb-0.5" />
                <div className="h-1.5 w-20 bg-orange-200 rounded-full mx-auto" />
              </div>
            </div>
            <div className="flex-1 px-5 py-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-gray-800 rounded-full" />
                <div className="h-5 w-24 bg-gray-100 rounded-md border border-gray-200" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {["Products", "Orders", "Customers"].map((label) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="h-1.5 w-12 bg-gray-200 rounded-full mb-2" />
                    <div className="h-4 w-10 bg-gray-300 rounded-md" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="h-2 w-16 bg-gray-300 rounded-full mb-3" />
                  <div className="flex items-end gap-1 h-10">
                    {[6, 8, 5, 9, 7, 10, 6, 8].map((h, i) => (
                      <div key={i} className="flex-1 bg-gray-200 rounded-sm" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="h-2 w-16 bg-gray-300 rounded-full mb-3" />
                  <div className="flex items-end gap-1 h-10">
                    {[4, 7, 9, 5, 8, 6, 10, 7, 5, 8].map((h, i) => (
                      <div key={i} className="flex-1 bg-orange-200 rounded-sm" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="h-2.5 w-24 bg-gray-700 rounded-full mb-3" />
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[0, 1, 2, 3].map((h) => (
                    <div key={h} className="h-1.5 bg-gray-300 rounded-full" />
                  ))}
                </div>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="grid grid-cols-4 gap-2 mb-2">
                    {[1, 2, 3, 4].map((col) => (
                      <div key={col} className="h-2 bg-gray-100 rounded-full border border-gray-200" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome to ApexSync</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {stepMeta[step - 1].desc}
          </p>

          <StepIndicator current={step} />

          {/* Step label */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">
            Step {step} — {stepMeta[step - 1].label}
          </p>

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form key={`step-1-${animKey}`} className="space-y-4 animate-slide-in-up" onSubmit={handleStep1}>
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                {checkEmailMutation.error && <p className="text-[11px] text-red-500 ml-1">{(checkEmailMutation.error as any).message}</p>}
              </div>
              <button
                type="submit"
                disabled={!email || checkEmailMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {checkEmailMutation.isPending ? <><Spinner /> Verifying…</> : "Continue"}
              </button>
            </form>
          )}

          {/* ── Step 2: Organisation ── */}
          {step === 2 && (
            <form key={`step-2-${animKey}`} className="space-y-4 animate-slide-in-up" onSubmit={handleStep2}>
              <LockedField label="Email" value={email} />
              <OrgDropdown value={orgId} onChange={setOrgId} organisations={organisations} />
              <button
                type="submit"
                disabled={!orgId || loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {loading ? <><Spinner /> Loading workspace…</> : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setAnimKey((k) => k + 1); }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Back
              </button>
            </form>
          )}

          {/* ── Step 3: Password ── */}
          {step === 3 && (
            <form key={`step-3-${animKey}`} className="space-y-4 animate-slide-in-up" onSubmit={handleStep3}>
              <LockedField label="Email" value={email} />
              <LockedField label="Organisation" value={selectedOrg?.name ?? ""} />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="text-right -mt-1">
                <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-orange-500 transition">
                  Forgot password?
                </Link>
              </div>

              {loginMutation.error && <p className="text-xs text-red-500 text-center">{(loginMutation.error as any).message}</p>}

              <button
                type="submit"
                disabled={!password || loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {loginMutation.isPending ? <><Spinner /> Signing in…</> : "Login"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(2); setAnimKey((k) => k + 1); }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Sign up */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-gray-800 font-semibold hover:text-orange-500 transition">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
