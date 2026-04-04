# RideShield Phase 2 Current State

RideShield is a mock-based income protection demo for gig delivery workers. It detects disruption events, creates claims automatically, scores fraud risk, and gives operators an explainable review surface when a claim should not go straight through.

This document describes what the repo does today. It does not cover future integration work or later learning pipelines.

## 💡 Ideation & Innovation (Beyond Must-Haves)

While the system fulfills all mandatory Phase 2 requirements (Zero-touch Claims, Dynamic AI Pricing, Parametric Automation, Fraud Detection), we have built several independent architectural innovations on top to address real-world edge cases for gig workers:

- **Flood-Aware Event Continuation:** Instead of strictly mapping "rain = payout," the system understands that streets remain dangerously waterlogged for hours after rainfall stops. We programmed "event continuation", meaning if order density remains suppressed even after the parametric threshold drops, the protective event stays open. 
- **Peak-Hour Decision Matrices:** Gig income is not uniform across a 24-hour cycle. We implemented a dynamic `peak_multiplier` which mathematically replaces income significantly higher if a disruption occurs during the prime dinner rush (7-10 PM) compared to a lull at 3 PM.
- **Explainable "Admin Queue" (Handling Edge Cases):** Rather than using strict algorithms that aggressively reject ambiguous claims, we built a 24-hour SLA review queue. If a worker is detected in a disruptive event without a strong behavioral track record, the system delays the claim into an explainer dashboard where human operators see the exact split of fraud risk vs validation.
- **Nuanced "Cluster Fraud" Detection:** We engineered protection against coordinated fraud rings (multiple claims from the identical geofence and timestamp). However, to protect legitimate users, the system checks the worker’s long-term `trust_score`. If a high-trust worker gets caught in a fraud cluster radius, they still get paid while spoofers are rejected. 
- **Anti-Inflation Income Defenses:** Because workers self-report their income during onboarding, they are incentivized to overstate it. The backend mathematically caps their validated income against `1.5x` of their city's demographic average, establishing safety inside the payout pool.
- **Operating Cost Deduction (Net Profit Mapping):** We explicitly account for the fact that when a worker is grounded by disruptions, they aren't burning petrol or compounding vehicle depreciation. The payout algorithm applies a dynamic `operating_cost_factor` (e.g., a 15% reduction to `0.85`) to ensure the insurance replaces their *true net profit*, preventing a moral hazard where being idle becomes more profitable than delivering.
- **Event-Centric Duplicate Handling:** The prompt mandates duplicate claim prevention. Instead of simply rejecting subsequent triggers as "duplicates," our backend extends them. If a rainstorm fires the trigger logic 3 consecutive times, the system links them to a *single geographic event* and seamlessly extends the payout duration on the original claim.

## What Is Working Now

### Zero-touch claims flow

- Workers register, buy a weekly plan, and stay active.
- When a validated disruption affects their zone, the backend creates the claim automatically.
- Clean claims move through a zero-touch approval path without requiring the worker to file anything.

### Signal-driven disruption detection

- Weather, AQI, traffic, and platform conditions are mock-driven in Phase 2.
- The backend still runs a real trigger loop, incident grouping, and claim creation flow on top of those signals.

### Fraud-aware decision engine

- Claim decisions combine disruption context, fraud scoring, trust score, confidence, and payout exposure.
- Lower-risk claims can auto-approve.
- Borderline cases are delayed into review instead of being rejected by default.

### Admin dashboard with explainability

- The admin surface shows the review queue, next recommended decision, queue pressure, confidence, and top review drivers.
- Explainability is part of the product surface, not hidden only in logs.

## How It Works

1. A worker registers, gives consent, and buys a weekly policy.
2. Mock disruption signals are monitored by the scheduler.
3. When thresholds are crossed, the system creates or extends an incident for the affected zone.
4. Eligible workers inside that incident are scored with trust, fraud, and payout-aware decision logic.
5. Claims are approved automatically, delayed into review, or rejected with reasons.

## Local Setup

### Prerequisites

- Python with a local `venv`
- Node.js and npm
- Docker Desktop

### Configure environment

Create `.env` from `.env.example` and set at minimum:
- `SESSION_SECRET`
- `ADMIN_PASSWORD`

The local stack expects PostgreSQL through Docker on host port `5433`.

### Start the stack

Windows PowerShell:

```powershell
.\scripts\run_all.ps1
```

That opens:
- backend docs at `http://localhost:8000/docs`
- frontend app at `http://localhost:3000`

### Seed demo data

```powershell
.\venv\Scripts\python.exe -m scripts.seed_data
```

### Manual startup if needed

Backend:

```powershell
.\scripts\run_dev.ps1
```

Frontend:

```powershell
.\scripts\run_frontend.ps1
```

## Demo Flow For Judges

1. Start the stack and seed demo data.
2. Open `http://localhost:3000/auth`.
3. Sign in as admin using the credentials from your local `.env`.
4. Open the Demo Runner and create a demo worker in a chosen city.
5. Run a disruption scenario such as heavy rain or platform outage.
6. Open the Admin Panel and show:
   - manual review queue
   - next recommended decision
   - confidence and review pressure
   - top review drivers
7. Optionally sign in as a worker to show onboarding, policy purchase, and worker-side claim visibility.

## What Phase 2 Does Not Claim

- Real weather, AQI, traffic, or partner integrations
- Automated learning or retraining from review outcomes
- Production payout rail integrations
- Experimental future integrations

## Related Docs

- [Architecture reference](architecture.md)
- [Workflow guide](workflow_guide.md)
- [Developer notes](DevNotes.md)
- [Phase 3 roadmap](Phase3_Roadmap.md)
