# RideShield API Reference

The detailed request and response schemas live in FastAPI Swagger at `/docs`.
This file is the practical route map for the current repo state.

## Core Route Groups

### Health
- `GET /health`
- `GET /health/db`
- `GET /health/config`

### Auth
- `POST /api/auth/worker/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Locations
- `GET /api/locations/cities`
- `GET /api/locations/zones`
- `GET /api/locations/config`

### Workers
- `POST /api/workers/register`
- `GET /api/workers/`
- `GET /api/workers/me/{worker_id}`
- `PUT /api/workers/me/{worker_id}`
- `GET /api/workers/risk-score/{worker_id}`

### Policies
- `GET /api/policies/plans/{worker_id}`
- `POST /api/policies/create`
- `GET /api/policies/active/{worker_id}`
- `GET /api/policies/history/{worker_id}`
- `POST /api/policies/activate-pending`
- `POST /api/policies/admin/force-activate`

### Triggers
- `POST /api/triggers/check`
- `GET /api/triggers/status`
- `POST /api/triggers/scenario/{scenario}`
- `POST /api/triggers/reset`

### Events
- `GET /api/events/active`
- `GET /api/events/history`
- `GET /api/events/detail/{event_id}`
- `GET /api/events/zone/{zone_name}`

### Claims
- `GET /api/claims/worker/{worker_id}`
- `GET /api/claims/detail/{claim_id}`
- `GET /api/claims/review-queue`
- `POST /api/claims/resolve/{claim_id}`
- `GET /api/claims/stats`

### Payouts
- `GET /api/payouts/worker/{worker_id}`
- `GET /api/payouts/detail/{payout_id}`
- `GET /api/payouts/stats`

### Analytics
- `GET /api/analytics/admin-overview`
- `GET /api/analytics/forecast`
- `GET /api/analytics/zone-risk`
- `GET /api/analytics/models`

## Important Contract Notes

### Auth
- Login endpoints return `token`
- Protected routes expect `Authorization: Bearer <token>`
- Worker and admin sessions are separate

### Worker Registration
- `POST /api/workers/register` requires:
  - `name`
  - `phone`
  - `password`
  - `city`
  - `platform`
  - `self_reported_income`
  - `working_hours`
  - `consent_given`
- `zone` is optional, but valid zones must resolve from the DB-backed geography layer

### Worker Risk
- `GET /api/workers/risk-score/{worker_id}` returns:
  - `risk_score`
  - `breakdown`
  - `model_version`
  - `fallback_used`
  - `premium_impact`
  - `recommended_plan`

### Claims And Events
- Worker claims response is an object with `claims`
- Review queue response is an object with `claims`
- Event history response is an object with `events`
- Claims are incident-centric, not trigger-stack-centric

### Analytics
- `admin-overview` is the main admin KPI payload
- `forecast` supports city-level or zone-level forecast reads
- `zone-risk` is city-scoped
- `models` is currently focused on:
  - risk model metadata
  - forecast engine status

## Current ML Truth

- Risk ML: integrated with safe fallback
- Forecast engine: integrated and exposed through analytics APIs
- Fraud ML: not integrated yet

That means:
- pricing and risk surfaces can expose model metadata
- claim fraud decisions are still rule-based today

## Geography Rule

Frontend location selectors and admin/demo filters should use:
- `GET /api/locations/cities`
- `GET /api/locations/zones`

`zone_id` is the internal source of truth. Legacy city/zone strings remain for compatibility and display.

## Recommended Local Verification

1. Start the stack with `.\scripts\run_all.ps1`
2. Open Swagger at `http://localhost:8000/docs`
3. Sign in on the frontend at `http://localhost:3000/auth`
4. Check:
   - worker onboarding
   - admin overview
   - demo runner scenarios
   - analytics forecast/models endpoints
