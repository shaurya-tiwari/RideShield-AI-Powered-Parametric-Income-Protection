# RideShield Manual Review Checklist

Use this checklist to validate the current repo manually after local startup.

## 1. Start The Stack

- [ ] Run:

```powershell
.\scripts\run_all.ps1
```

- [ ] Confirm frontend is available at `http://localhost:3000`
- [ ] Confirm backend docs are available at `http://localhost:8000/docs`

## 2. Seed Demo Data

- [ ] Run:

```powershell
.\venv\Scripts\python.exe -m scripts.seed_data
```

- [ ] Confirm demo workers exist

## 3. Worker Review

- [ ] Open `/auth`
- [ ] Sign in as worker
- [ ] Confirm `/dashboard` loads
- [ ] Confirm the dashboard shows:
  - [ ] active policy
  - [ ] decision panel / selected claim
  - [ ] risk score card
  - [ ] payout history
  - [ ] nearby alerts
- [ ] Refresh the page
- [ ] Confirm the session persists

## 4. Onboarding Review

- [ ] Sign out
- [ ] Open `/onboarding`
- [ ] Register a new worker
- [ ] Confirm the flow shows:
  - [ ] registration fields
  - [ ] risk score
  - [ ] available plans
  - [ ] premium explanation
- [ ] Purchase a plan
- [ ] Confirm completion state appears

## 5. Admin Review

- [ ] Open `/auth`
- [ ] Sign in as admin
- [ ] Confirm redirect to `/admin`
- [ ] Confirm the admin panel shows:
  - [ ] KPI cards
  - [ ] review queue
  - [ ] next decision panel
  - [ ] scheduler state
  - [ ] model status
  - [ ] disruption feed
  - [ ] integrity preview
  - [ ] forecast horizon
  - [ ] disruption map

- [ ] Change city filter
- [ ] Confirm review and supporting panels react to the filter
- [ ] Change zone filter
- [ ] Confirm the same

## 6. Intelligence Review

- [ ] Open `/intelligence`
- [ ] Confirm the page shows:
  - [ ] scheduler posture
  - [ ] monitored cities
  - [ ] KPI interpretation text
  - [ ] forecast bands
  - [ ] threshold notes

- [ ] Confirm loss ratio reads as a percentage and includes interpretation
- [ ] Confirm forecast bands use:
  - [ ] low
  - [ ] guarded
  - [ ] elevated
  - [ ] critical

## 7. Demo Runner Review

- [ ] Open `/demo`
- [ ] Click `Create demo worker`
- [ ] Confirm worker creation succeeds without a 422 validation error
- [ ] Run `Heavy Rain`
- [ ] Confirm result summary updates
- [ ] Confirm live activity log updates
- [ ] Confirm signal snapshots update
- [ ] Run another scenario
- [ ] Confirm the result card updates again
- [ ] Click `Reset simulators`

## 8. Review Queue Flow

- [ ] Use a scenario that produces delayed claims
- [ ] Open `/admin`
- [ ] Confirm the queue shows grouped incident context
- [ ] Approve a delayed claim
- [ ] Confirm queue refresh
- [ ] Reject a delayed claim
- [ ] Confirm queue refresh again

## 9. Analytics API Spot Checks

- [ ] In Swagger, verify:
  - [ ] `GET /api/analytics/admin-overview`
  - [ ] `GET /api/analytics/forecast`
  - [ ] `GET /api/analytics/zone-risk`
  - [ ] `GET /api/analytics/models`

- [ ] Confirm `models` shows:
  - [ ] risk model status
  - [ ] version
  - [ ] trained timestamp when available
  - [ ] metrics

## 10. Final Acceptance

Mark manual review as passed only if all are true:

- [ ] worker auth works
- [ ] admin auth works
- [ ] onboarding works end to end
- [ ] demo worker creation works
- [ ] scheduler is visible and understandable
- [ ] admin filters affect the actual decision surface
- [ ] intelligence page KPI interpretation is readable and correct
- [ ] claims and payouts update correctly
- [ ] no obvious white-on-light or collapsed-card regressions remain
