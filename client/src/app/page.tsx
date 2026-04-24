import Link from "next/link";

function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">ApexSync</span>
          <span className="text-[10px] font-medium text-orange-500 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">PMIS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition">How it works</a>
          <a href="#personas" className="hover:text-gray-900 transition">Who it&apos;s for</a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg transition"
          >
            Sign in
          </Link>
          <Link
            href="/onboard"
            className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            Create organisation
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-24 bg-[#e8ede3] relative overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle, #00000008 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            Decision intelligence for elite sports organizations
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
            From fragmented data<br />
            to <span className="text-orange-500">defensible decisions</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl leading-relaxed mb-10">
            ApexSync PMIS sits above Catapult, Kitman Labs, and WHOOP — aggregating signals, surfacing conflicts, and guiding your staff to aligned, auditable readiness and return-to-play decisions.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm text-sm"
            >
              Create your organisation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
            </div>
            <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-[11px] text-gray-400 text-center">
              app.apexsync.io/athletes
            </div>
          </div>
          <div className="flex" style={{ height: "340px" }}>
            {/* Sidebar */}
            <div className="w-44 border-r border-gray-100 p-3 flex flex-col gap-1 shrink-0">
              <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">Navigation</div>
              {[
                { label: "Athlete Status", active: true },
                { label: "Decisions", active: false },
                { label: "Conflict Alerts", active: false, badge: "3" },
                { label: "Audit Trail", active: false },
                { label: "Ownership", active: false },
              ].map(({ label, active, badge }) => (
                <div key={label} className={`flex items-center justify-between px-2 py-1.5 rounded-md ${active ? "bg-orange-50" : ""}`}>
                  <div className={`text-[11px] font-medium ${active ? "text-orange-600" : "text-gray-500"}`}>{label}</div>
                  {badge && (
                    <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Main content */}
            <div className="flex-1 p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-3 w-28 bg-gray-800 rounded-full mb-1.5" />
                  <div className="h-2 w-40 bg-gray-200 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-orange-500 rounded-lg" />
                  <div className="h-7 w-20 bg-gray-100 border border-gray-200 rounded-lg" />
                </div>
              </div>
              {/* Athlete cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { status: "green", conflict: false },
                  { status: "amber", conflict: true },
                  { status: "red", conflict: false },
                ].map(({ status, conflict }, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200" />
                      <div className={`w-2 h-2 rounded-full ${status === "green" ? "bg-green-400" : status === "amber" ? "bg-amber-400" : "bg-red-400"}`} />
                    </div>
                    <div className="h-2 w-16 bg-gray-300 rounded-full mb-1" />
                    <div className="h-1.5 w-20 bg-gray-200 rounded-full mb-2" />
                    {conflict && (
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <div className="h-1.5 w-14 bg-amber-200 rounded-full" />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {[0, 1, 2].map((j) => (
                        <div key={j} className="h-1.5 bg-gray-200 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Decision brief */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded bg-orange-200" />
                  <div className="h-2 w-28 bg-orange-300 rounded-full" />
                  <div className="ml-auto h-1.5 w-12 bg-orange-200 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-orange-200 rounded-full" />
                  <div className="h-1.5 w-4/5 bg-orange-200 rounded-full" />
                  <div className="h-1.5 w-3/4 bg-orange-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      title: "Fragmented signals",
      body: "Medical, load, and subjective wellness data lives in separate tools. No single view of an athlete's readiness.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      title: "Conflicting interpretations",
      body: "Medical, coaching, and performance staff reach different conclusions from the same data — with no structured process to resolve disagreement.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: "Undocumented decisions",
      body: "Readiness and RTP decisions are made verbally or in email threads. No audit trail, no rationale capture, no defensibility.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">The Problem</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The bottleneck is not data. It&apos;s decisions.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Elite sports organizations collect more performance and medical data than ever — yet readiness decisions remain slow, inconsistent, and poorly documented.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map(({ icon, title, body }) => (
            <div key={title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 mb-4 shadow-sm">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      number: "01",
      title: "Unified athlete status view",
      body: "Aggregates medical clearance, load data, subjective wellness, and rehab milestones from Catapult, Kitman Labs, WHOOP, and proprietary EMRs. Refreshes within 15 minutes of any source update.",
      tag: "Core",
    },
    {
      number: "02",
      title: "Conflict detection",
      body: "Automatically flags when signals disagree across domains — e.g., high subjective wellness paired with declining load tolerance. False positive rate held below 10%.",
      tag: "AI-assisted",
    },
    {
      number: "03",
      title: "Uncertainty surfacing",
      body: "Confidence indicators and data-gap warnings on every metric and summary. A missing signal is never silently dropped — it is explicitly surfaced as a gap.",
      tag: "Core",
    },
    {
      number: "04",
      title: "Decision brief generation",
      body: "Structured AI summary of inputs considered, conflicts detected, reasoning path, and ownership assignment — for every readiness call. Every claim is traceable to a source.",
      tag: "AI-assisted",
    },
    {
      number: "05",
      title: "Rationale capture",
      body: "Guided structured fields — not free text — at every decision point. Completable in under 2 minutes. Stored with immutable audit trail including who, what, and when.",
      tag: "Core",
    },
    {
      number: "06",
      title: "Ownership routing & escalation",
      body: "Configurable rules route each readiness decision to the accountable stakeholder with a deadline. Unresolved or high-conflict decisions auto-escalate to the next tier.",
      tag: "Workflow",
    },
    {
      number: "07",
      title: "Post-decision explainability",
      body: "Decision logs linking inputs to rationale to outcome — filterable and exportable. Full audit trail for every decision in the system.",
      tag: "Audit",
    },
  ];

  const tagColors: Record<string, string> = {
    Core: "bg-gray-100 text-gray-600",
    "AI-assisted": "bg-orange-50 text-orange-600 border border-orange-100",
    Workflow: "bg-blue-50 text-blue-600",
    Audit: "bg-green-50 text-green-700",
  };

  return (
    <section id="features" className="py-20 bg-[#e8ede3]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">MVP Features</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything needed for defensible decisions
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Seven capabilities built in the order that matters — from data aggregation to full audit trail.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.slice(0, 6).map(({ number, title, body, tag }) => (
            <div key={number} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl font-bold text-gray-200">{number}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[tag]}`}>{tag}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        {/* Feature 07 full-width */}
        <div className="mt-4 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start gap-6">
            <span className="text-2xl font-bold text-gray-200 shrink-0">{features[6].number}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{features[6].title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[features[6].tag]}`}>{features[6].tag}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{features[6].body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Aggregate",
      body: "All connected sources — Catapult, Kitman, WHOOP, EMR — are pulled into a unified athlete status view.",
      color: "bg-blue-500",
    },
    {
      step: "2",
      title: "Detect",
      body: "The AI agent scans for conflicts across medical, load, and subjective domains and flags them explicitly.",
      color: "bg-orange-500",
    },
    {
      step: "3",
      title: "Surface",
      body: "Data gaps and confidence levels are displayed alongside every metric — no signal is ever silently dropped.",
      color: "bg-amber-500",
    },
    {
      step: "4",
      title: "Brief",
      body: "A structured decision brief is generated: inputs, conflicts, reasoning path, and ownership assignment.",
      color: "bg-purple-500",
    },
    {
      step: "5",
      title: "Capture",
      body: "Staff complete guided rationale fields in under 2 minutes. Every entry is stored with a full audit trail.",
      color: "bg-green-500",
    },
    {
      step: "6",
      title: "Route",
      body: "The decision is routed to the accountable stakeholder with a deadline. Unresolved decisions auto-escalate.",
      color: "bg-red-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            From raw signal to auditable decision
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-base">
            A six-stage workflow that brings every stakeholder to alignment — without adding decision burden.
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map(({ step, title, body, color }, i) => (
            <div key={step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%-4px)] w-4 h-px bg-gray-200 z-10" />
              )}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold text-sm mb-3`}>
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonasSection() {
  const personas = [
    {
      role: "Director of Performance",
      type: "Primary",
      needs: ["Unified athlete view across all sources", "Ownership clarity on every decision", "Full decision audit trail"],
      icon: "D",
    },
    {
      role: "Head Athletic Trainer",
      type: "Secondary",
      needs: ["Conflict alerts when signals disagree", "Structured rationale capture", "Defensible documentation"],
      icon: "T",
    },
    {
      role: "Rehab / RTP Lead",
      type: "Secondary",
      needs: ["Guided rationale fields for RTP decisions", "Escalation visibility", "Milestone tracking"],
      icon: "R",
    },
    {
      role: "Sports Science Lead",
      type: "Secondary",
      needs: ["Uncertainty surfacing on all metrics", "Data-gap warnings", "Source traceability on AI outputs"],
      icon: "S",
    },
  ];

  return (
    <section id="personas" className="py-20 bg-[#e8ede3]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">Who it&apos;s for</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for the multi-disciplinary staff team
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Every persona gets the view they need — filtered by role, scoped to their decisions, with no cross-org data access.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map(({ role, type, needs, icon }) => (
            <div key={role} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 leading-tight">{role}</div>
                  <div className={`text-[10px] font-medium mt-0.5 ${type === "Primary" ? "text-orange-500" : "text-gray-400"}`}>
                    {type} user
                  </div>
                </div>
              </div>
              <ul className="space-y-2">
                {needs.map((need) => (
                  <li key={need} className="flex items-start gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {need}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  const metrics = [
    { value: "−40%", label: "Time to shared stakeholder understanding", sub: "target within 6 months" },
    { value: ">90%", label: "Context completeness rate", sub: "all relevant data surfaced" },
    { value: ">95%", label: "Rationale capture rate", sub: "documented before decision closes" },
    { value: "<10%", label: "False escalation rate", sub: "precision conflict detection" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">Success Metrics</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Measurable outcomes from day one
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map(({ value, label, sub }) => (
            <div key={label} className="text-center border border-gray-100 rounded-2xl p-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">{value}</div>
              <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuardrailsSection() {
  const constraints = [
    "Never generates clinical assessments, diagnoses, or treatment plans",
    "Never auto-approves or clears — every decision requires a named human owner",
    "Never presents AI output as a medical recommendation",
    "Never silently drops a data gap — missing signals are surfaced, not ignored",
    "All AI outputs include source references, confidence level, and explicit human-judgment framing",
  ];

  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-widest mb-4">Safety by design</p>
            <h2 className="text-3xl font-bold mb-5 leading-tight">
              The AI synthesizes and surfaces.<br />
              <span className="text-orange-400">Humans always decide.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              ApexSync operates under hard constraints. The system owns the decision layer — context aggregation, conflict surfacing, attention triggering — not the decision itself. Every output is traceable, hedged, and framed for human judgment.
            </p>
          </div>
          <div className="space-y-3">
            {constraints.map((c) => (
              <div key={c} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-sm text-gray-300">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-[#e8ede3]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
          Ready to own the decision layer?
        </h2>
        <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto">
          Give your staff a shared, defensible, auditable path from data to decision — across every athlete, every day.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg text-base"
          >
            Create your organisation
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl transition text-base"
          >
            Sign in to existing org
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">ApexSync PMIS</span>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Performance-Medical Intelligence System — Decision intelligence for elite sports organizations.
        </p>
        <div className="flex gap-6 text-xs text-gray-400">
          <a href="#features" className="hover:text-gray-700 transition">Features</a>
          <a href="#how-it-works" className="hover:text-gray-700 transition">How it works</a>
          <Link href="/login" className="hover:text-gray-700 transition">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PersonasSection />
        <MetricsSection />
        <GuardrailsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
