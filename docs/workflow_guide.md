# RideShield Workflow Guide

This guide is the practical runbook for the current repo.

It does not restate the final product narrative from `README.md`. It focuses on:
- how to run the stack
- what each role can do
- what is real today
- what is still simulated or deferred

## Operating Loop

```text
Observe signals -> detect incident -> verify policy -> score decision -> pay or review
```

Important product rule:
- workers do not file claims manually
- the system generates claims from validated incidents

## Current System Shape

### Simulated Inputs
- `simulations/weather_mock.py`
- `simulations/aqi_mock.py`
- `simulations/traffic_mock.py`
- `simulations/platform_mock.py`

### Real Core Engine
- `backend/core/trigger_engine.py`
- `backend/core/claim_processor.py`
- `backend/core/fraud_detector.py`
- `backend/core/decision_engine.py`
- `backend/core/income_verifier.py`
- `backend/core/payout_executor.py`

### ML / Forecast Layer
- `backend/core/risk_model_service.py`
- `backend/core/forecast_engine.py`
- `backend/ml/risk_model.py`
- `backend/ml/features/risk_features.py`
- `backend/ml/explainability.py`

### Frontend Surfaces
- worker onboarding
- worker dashboard
- admin oversight
- demo runner
- how-it-works explainer
- intelligence overview

## Current Truth

### Integrated now
- weekly policy purchase and activation
- trigger monitoring and scheduler
- incident-centric claim generation
- payout execution
- DB-backed geography
- risk-model-backed risk surface with fallback
- forecast analytics and model-status endpoints

### Still rule-based
- fraud scoring
- claim fraud routing

### Not integrated yet
- runtime fraud ML model
- blended ML fraud score in claim processing

## Local Setup

### 1. Start the full stack

```powershell
.\scripts\run_all.ps1
```

This starts:
- Docker Postgres
- FastAPI backend
- Vite frontend

### 2. Seed demo data

```powershell
.\venv\Scripts\python.exe -m scripts.seed_data
```

### 3. Open the app

- frontend: `http://localhost:3000`
- backend docs: `http://localhost:8000/docs`

## Auth And Roles

### Worker
- sign in at `/auth`
- phone + password based session
- sees onboarding, dashboard, payouts, claims, risk

### Admin
- sign in at `/auth`
- separate admin session
- sees admin oversight, intelligence page, demo runner, review queue

## Worker Workflow

### New worker
1. Open `/onboarding`
2. Register worker profile
3. Receive risk score and plan options
4. Buy weekly plan
5. Open `/dashboard`

### Returning worker
1. Open `/auth`
2. Sign in
3. Review:
   - active policy
   - claim decision cluster
   - payouts
   - risk score and explanation
   - nearby incidents

## Admin Workflow

1. Sign in as admin
2. Open `/admin`
3. Review:
   - KPI strip
   - review queue / next decision
   - scheduler state
   - model status
   - incident feed
   - integrity preview
   - forecast horizon
   - disruption map
4. Use city/zone filters to narrow the decision surface
5. Resolve delayed claims when present

## Demo Runner Workflow

1. Sign in as admin
2. Open `/demo`
3. Select city
4. Click `Create demo worker` if needed
5. Run a scenario
6. Review:
   - result summary
   - live activity log
   - cause-and-effect flow
   - signal snapshots
7. Reset simulators when done

Notes:
- demo worker creation now sends the full worker registration payload, including password
- demo failures should surface inline in the page instead of failing silently

## Intelligence Overview Workflow

Use `/intelligence` as the explanation surface.

It is for:
- scheduler posture
- monitored geography
- trigger layers
- fraud/trust/decision relationships
- current system indicators
- forecast bands and KPI interpretation

It is not the same thing as the admin decision queue.

## Geography Rule

Current supported cities:
- Delhi
- Mumbai
- Bengaluru
- Chennai

Selectors should be driven from:
- `/api/locations/cities`
- `/api/locations/zones`

The frontend should not treat hardcoded city constants as the source of truth.

## Runtime Logs

Useful local logs:
- `logs/runtime/app_runtime.txt`
- `logs/runtime/trigger_cycles.txt`

Use `trigger_cycles.txt` to inspect:
- scheduler runs
- zone-level signals
- trigger outcomes
- incident create vs extend behavior
- claim counts
- payout totals

## Useful Docs

- `docs/api_reference.md`
- `docs/manual_review_script.md`
- `docs/pitch_deck_outline.md`
- `docs/SPRINT_4A_EXECUTION.md`
- `docs/DevNotes.md`
