# RideShield Phase 2 Current State

RideShield is a mock-based income protection demo for gig delivery workers. It detects disruption events, creates claims automatically, scores fraud risk, and gives operators an explainable review surface when a claim should not go straight through.

This document describes what the repo does today. It does not cover future integration work or later learning pipelines.

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
