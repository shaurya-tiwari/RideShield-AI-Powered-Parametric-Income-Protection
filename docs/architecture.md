# RideShield Architecture Reference

This file is the repo-local architecture reference for the current implementation.

It is intentionally shorter and more operational than the root `Architecture.md`.
The root document remains the final narrative document. This file is the codebase-facing companion.

## Current Architecture Shape

RideShield is currently a layered system with:
- a React frontend
- a FastAPI backend
- PostgreSQL persistence
- simulated external signal inputs
- real decisioning, claims, payout, and scheduler logic
- partial ML runtime integration

## Backend Layers

### API Layer
Current route groups:
- auth
- workers
- policies
- triggers
- events
- claims
- payouts
- analytics
- health
- locations

### Core Runtime Layer
Current core services:
- `backend/core/trigger_engine.py`
- `backend/core/claim_processor.py`
- `backend/core/fraud_detector.py`
- `backend/core/decision_engine.py`
- `backend/core/income_verifier.py`
- `backend/core/payout_executor.py`
- `backend/core/trigger_scheduler.py`

### ML / Forecast Layer
Current runtime additions:
- `backend/core/risk_model_service.py`
- `backend/core/forecast_engine.py`
- `backend/ml/risk_model.py`
- `backend/ml/features/risk_features.py`
- `backend/ml/explainability.py`

### Data Layer
- PostgreSQL-backed worker, policy, event, claim, payout, trust, audit, and geography models
- DB-backed cities and zones
- zone threshold profiles and zone risk profiles

## Current Decisioning Truth

### Real today
- trigger evaluation
- incident creation and extension
- claim generation
- payout execution
- scheduler loop
- audit logging

### Hybrid today
- risk scoring uses runtime ML-first behavior with safe fallback
- forecast analytics use a dedicated forecast engine and risk-model-backed projections

### Still rule-based today
- fraud detection
- final suspicious-claim routing

This is the most important current architecture truth:
- risk ML is integrated
- fraud ML is not integrated yet

## Claims Model

RideShield is incident-centric, not trigger-stack-centric.

Meaning:
- one incident window should produce one claim path per worker
- overlapping trigger signals are evidence on an incident
- they are not separate stacked payouts for the same lost window

This rule is already reflected in:
- trigger engine behavior
- grouped claim views
- admin review queue grouping

## Geography Foundation

The repo has moved past hardcoded frontend-only geography.

Current rule:
- `zone_id` is the backend source of truth
- legacy `city` and `zone` strings remain for compatibility and display

Current supported cities:
- Delhi
- Mumbai
- Bengaluru
- Chennai

Current source-of-truth endpoints:
- `GET /api/locations/cities`
- `GET /api/locations/zones`
- `GET /api/locations/config`

## Frontend Surface Architecture

Current major pages:
- `Home.jsx`
- `Auth.jsx`
- `Onboarding.jsx`
- `HowItWorks.jsx`
- `IntelligenceOverview.jsx`
- `Dashboard.jsx`
- `AdminPanel.jsx`
- `DemoRunner.jsx`

Current surface split:
- worker dashboard = decision surface
- admin panel = decision surface
- demo runner = decision surface
- home / how-it-works / intelligence = explanation surfaces

This distinction matters because earlier versions mixed narrative and operations too heavily.

## Runtime Observability

Current local observability includes:
- `logs/runtime/app_runtime.txt`
- `logs/runtime/trigger_cycles.txt`
- scheduler state in `/health/config`
- scheduler and model visibility in admin/intelligence surfaces

Use these to inspect:
- trigger cadence
- zone-level signal values
- incident create vs extend behavior
- claim volumes
- payout totals

## Analytics Architecture

Current analytics routes include:
- `GET /api/analytics/admin-overview`
- `GET /api/analytics/forecast`
- `GET /api/analytics/zone-risk`
- `GET /api/analytics/models`

Current intent:
- `admin-overview` = KPI and oversight payload
- `forecast` = city or zone projection surface
- `zone-risk` = ranked city zone view
- `models` = runtime model metadata/status

## Security Posture

Current enforcement:
- worker and admin sessions are separated
- worker routes enforce ownership
- admin analytics remain admin-only
- CORS is origin-restricted
- baseline browser security headers are enabled

## Known Current Gaps

- fraud ML runtime integration is still pending
- payout model still needs a net-income adjustment pass if the product story wants explicit operating-cost deduction
- some frontend surfaces still have room for density and hierarchy tightening
- the Tailwind `@responsive` warning in `frontend/src/index.css` is still present

## Next Architecture Step

The next major technical step should be:
1. fraud feature extraction
2. fraud model training
3. fraud model service
4. blended rule + ML fraud scoring
5. claim processor integration
6. fraud explainability in admin review surfaces
