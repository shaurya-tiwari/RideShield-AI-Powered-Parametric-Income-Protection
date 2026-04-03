# Phase 3 Roadmap

This document lists work that is intentionally out of scope for the current Phase 2 submission.

Phase 2 stays focused on the stable mock-based product:
- mock disruption inputs
- real incident and claim orchestration inside the app
- fraud-aware review flow
- admin explainability for demo and operator use

Everything below is future work.

## A. Real Provider Integration

Phase 3 should replace the mock signal layer with real external providers.

Planned areas:
- live weather APIs
- live AQI APIs
- live traffic APIs
- replacing mock providers without rewriting the claim flow
- provider rate limiting
- fallback behavior when providers are unavailable
- stale-data handling and freshness rules

## B. Learning And Data Pipeline

Phase 3 should add structured memory for decisions and outcomes.

Planned areas:
- a `training_events` or decision-log table
- storing the feature snapshot seen at decision time
- storing the system decision separately from the final label or human verdict
- offline retraining workflows rather than automatic self-learning
- evaluation and comparison before any model deployment

## C. Advanced Fraud Detection

Phase 3 should move beyond the current hybrid baseline.

Planned areas:
- stronger feature engineering
- fraud-pattern learning from real operating data
- better separation of weak and strong suspicious signals
- threshold calibration based on review outcomes

## D. System Adaptation

Phase 3 should make the system better at adapting to operating pressure.

Planned areas:
- dynamic thresholds based on queue pressure
- stronger confidence calibration
- better use of review feedback to reduce unnecessary delays
- safer automation bands for approve, review, and reject behavior

## E. Payout Integration (Simulated)

Phase 3 should make payout handling feel more product-complete while still staying safe for demo use.

Planned areas:
- mock payment gateway integration
- clearer instant payout flow
- richer payout status tracking
- improved payout notifications and audit visibility

## F. Observability And Analytics Expansion

Phase 3 should improve how the system measures its own behavior.

Planned areas:
- model and rule drift detection
- false review rate tracking
- stronger zero-touch and auto-approval tracking
- better long-window operational summaries
- richer admin analytics for queue behavior and decision quality

## Phase 3 Guiding Rule

Phase 3 should expand the system carefully:
- keep the current stable Phase 2 flow intact
- evaluate new behavior before deployment
- avoid presenting future architecture as already implemented
