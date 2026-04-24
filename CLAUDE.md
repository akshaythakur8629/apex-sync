# ApexSync — Performance-Medical Intelligence System (PMIS)

## What This Product Is

ApexSync PMIS is a **decision-intelligence layer** for elite sports organizations. It sits *above* existing data collection tools (Catapult, Kitman Labs, WHOOP, proprietary EMRs) and helps multi-disciplinary staff reach aligned, defensible **readiness and return-to-play (RTP) decisions**.

The core problem is not data availability — it is **decision quality**. Data lives in fragmented systems, interpretations conflict across medical, coaching, and performance stakeholders, and decisions are poorly documented. ApexSync owns the layer between raw data and the human who makes the call.

**This is not a dashboard. Not a chatbot. Not a predictive model.** It is a structured decision workflow with AI-assisted synthesis, conflict detection, uncertainty surfacing, and full audit trail.

---

## Repo Structure

```
apex-sync/
├── client/          # Next.js 16 frontend (TypeScript, Tailwind CSS, App Router)
│   └── src/app/
│       ├── login/   # 3-step login: email → org → password
│       └── ...      # Feature pages to be built
├── server/          # Node.js/Express API (to be scaffolded)
└── CLAUDE.md        # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js / Express (server/ — not yet scaffolded) |
| Auth | Multi-tenant org-based login (email → org → password) |
| AI/Agent | Claude API (Anthropic) — synthesis, conflict detection, brief generation |
| Data sources | Catapult, Kitman Labs, WHOOP, proprietary EMRs (via connectors) |
| Design tokens | Orange `#f97316` primary, sage green `#e8ede3` brand bg, black `#000` logo |

---

## Core Domain Concepts

These terms have precise meaning in this codebase. Use them consistently.

| Term | Definition |
|------|-----------|
| **Readiness decision** | A structured determination of whether an athlete is fit to train or compete — requires inputs from medical, load, and subjective domains |
| **RTP (Return to Play)** | The specific readiness decision made after an injury — highest stakes, highest scrutiny |
| **Decision brief** | AI-generated structured summary of inputs considered, conflicts detected, reasoning path, and ownership assignment for a given readiness call |
| **Conflict detection** | Automatic flagging when data signals disagree across domains (e.g., high subjective wellness + declining load tolerance) |
| **Uncertainty surfacing** | Displaying confidence indicators and data-gap warnings alongside every status summary |
| **Rationale capture** | Structured prompts at each decision point — guided fields, not free text — stored with full audit trail |
| **Ownership routing** | Assigning a readiness decision to the accountable stakeholder with a deadline and escalation path |
| **Escalation** | Automatic promotion of an unresolved or high-conflict decision to the next stakeholder tier |
| **Audit trail** | Immutable log of every decision: inputs, rationale, conflicts, ownership, timestamp, outcome |
| **Data gap** | A missing or stale source that should have contributed to a readiness decision — must be surfaced, never silently ignored |
| **Source traceability** | Every AI-generated output must reference the specific source data it was derived from |

---

## User Personas

| Persona | Role | Primary Need |
|---------|------|-------------|
| **Director of Performance** | Primary user | Unified athlete view, ownership clarity, decision audit |
| **Head Athletic Trainer** | Secondary | Conflict alerts, rationale capture, defensibility |
| **Rehab / RTP Lead** | Secondary | Rationale capture, escalation visibility |
| **Sports Science Lead** | Secondary | Uncertainty surfacing, data-gap warnings |

V1 is **staff-facing only**. No athlete-facing features in MVP.

---

## MVP Feature Areas (V1 Scope)

Build these in order. Do not add features outside this list without explicit instruction.

1. **Unified athlete status view** — aggregates medical clearance, load data, subjective wellness, rehab milestones from connected sources. Data must refresh within 15 minutes of source update.
2. **Conflict detection** — agent flags when signals disagree across domains. False positive rate must stay below 10%.
3. **Uncertainty surfacing** — confidence indicators + data-gap warnings on every metric and summary.
4. **Decision brief generation** — structured AI summary: inputs, conflicts, reasoning path, ownership.
5. **Rationale capture** — guided fields (not free-text), completable in under 2 minutes, stored with audit trail.
6. **Ownership routing** — configurable rules route each decision to accountable stakeholder with deadline + escalation.
7. **Post-decision explainability** — decision logs linking inputs → rationale → outcome, filterable and exportable.

**Out of scope for V1:** predictive analytics, injury prediction, clinical diagnoses, athlete-facing features, mobile app, cross-org benchmarking, automated decision execution.

---

## Hard Constraints — Never Violate These

These are non-negotiable product and safety boundaries. If a feature request would cross these lines, flag it before implementing.

- **Never generate clinical assessments, diagnoses, treatment plans, or clearance recommendations.** The AI synthesizes and surfaces — it never decides.
- **Never auto-approve, auto-clear, or take action without explicit human confirmation.** Every decision requires a named human owner.
- **Never present AI output as a medical recommendation.** All outputs must include source references, confidence level, and explicit "for human judgment" framing.
- **Never silently drop a data gap.** If a source is missing or stale, surface it explicitly — a missing signal is itself a signal.
- **Never allow scope creep toward prediction.** If a stakeholder asks "will this athlete get re-injured?" — the system does not answer that question. It surfaces relevant context for the human to reason about.
- **Hallucination guardrails are mandatory** on all LLM outputs that touch athlete status or readiness. Every claim must be traceable to a source.

---

## AI / Agent Behavior Guidelines

The agent's role: **context aggregation, conflict surfacing, attention triggering, escalation routing, and unstructured data synthesis.**

When writing prompts or agent logic:
- Always include source references in generated outputs
- Always include a confidence indicator (high / medium / low / insufficient data)
- Always flag conflicts explicitly — never blend or average conflicting signals silently
- Always include a reasoning path in decision briefs
- Never make predictive statements ("this athlete is likely to re-injure")
- Never make normative recommendations ("this athlete should be cleared")
- Use hedged, transparent language: "Data signals suggest…", "The following conflict was detected…", "Insufficient data to assess…"

---

## Auth & Multi-Tenancy

Login is a **3-step wizard**: email → org selection → password.

- Org selection determines the tenant context for all subsequent data and decisions
- Role within org (Director of Performance, Athletic Trainer, Rehab Lead, Sports Science Lead) determines view permissions and decision routing rules
- All data is strictly tenant-scoped — no cross-org data access

---

## Coding Conventions

- **TypeScript strict mode** everywhere in `client/`
- **No `any` types** — define proper interfaces for all athlete, decision, and brief data structures
- **No comments explaining what code does** — name things clearly instead
- **Comment only non-obvious WHY** — guardrail logic, medical-legal constraints, and escalation rules warrant brief comments
- **No predictive/diagnostic language in UI copy** — follow the same constraints as the AI layer
- **Audit trail on every write operation** — any mutation to a decision, rationale, or athlete status must log who/what/when
- **Error states are first-class** — a failed data source fetch is not an empty state; it is a data-gap warning that must be shown

---

## Key Success Metrics (Reference When Building)

| Metric | Target |
|--------|--------|
| Time to shared stakeholder understanding | -40% within 6 months |
| Context completeness rate | >90% of decisions have all relevant data surfaced |
| Rationale capture rate | >95% of decisions have documented rationale |
| False escalation rate | <10% |
| Stakeholder alignment score | >4.0 / 5.0 post-decision survey |
| Decision throughput | No increase beyond current baseline (PMIS must not add burden) |

---

## Competitive Context

ApexSync is **not** competing with Catapult, Kitman Labs, or WHOOP — it integrates with them. The moat is owning the **decision layer**: the space between data collection and the human making the call. No existing tool in sports performance or medical intelligence provides this constrained, decision-first architecture.
