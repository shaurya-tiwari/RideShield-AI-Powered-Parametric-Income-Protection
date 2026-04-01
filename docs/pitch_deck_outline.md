# RideShield Pitch Deck Outline

Use this outline for the current repo state, not the older sprint markdown claims.

## 1. Problem

- Gig delivery workers lose income from:
  - rain
  - heat
  - AQI
  - traffic collapse
  - platform outage
  - civic disruption
- Traditional claims-based insurance is too slow and too manual for weekly income continuity

## 2. Product

- Weekly parametric income protection
- Zero-touch claim generation
- Incident-centric decisioning
- Automatic payout or bounded manual review

## 3. Persona Story

- legitimate worker: instant approval and payout
- suspicious worker: delayed or rejected
- borderline worker: routed to review queue with explanation

## 4. System Architecture

- worker onboarding and weekly policy purchase
- trigger engine and scheduler
- incident creation / extension
- rule-based fraud detection today
- decision engine and payout executor
- DB-backed geography and audit trail

## 5. Current ML Story

- risk model:
  - integrated with fallback
  - used for risk surfaces and premium metadata
- forecast engine:
  - integrated into analytics
  - exposed in admin and intelligence surfaces
- fraud ML:
  - planned next
  - not currently integrated into runtime claim decisions

Keep this section honest. Do not present fraud ML as finished.

## 6. Worker Surface Story

- active policy
- decision-first dashboard
- claim explanation
- payout history
- risk score and contributing factors

## 7. Admin Surface Story

- review queue
- next decision
- KPI overview
- disruption feed
- forecast horizon
- model status
- scheduler visibility

## 8. Demo Story

- create demo worker
- run scenario
- show signals crossing thresholds
- show incident creation
- show claim decision
- show payout or review outcome

## 9. Business Viability

- weekly premium framing
- coverage caps
- loss ratio
- simulated but auditable operating model

## 10. What Is Real vs Simulated

### Real now
- decision pipeline
- scheduler
- claims and payouts
- admin/worker surfaces
- risk-model service
- forecast engine

### Simulated now
- weather / AQI / traffic / platform source feeds
- payout rail as sandbox/demo behavior

## 11. Next Technical Step

- ML fraud feature pipeline
- fraud model service
- blended rule + ML claim fraud score
- explainable fraud review UI
