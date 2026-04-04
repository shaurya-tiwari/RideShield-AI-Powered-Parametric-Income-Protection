# Phase 3 Roadmap

This document lists work that is intentionally out of scope for the current Phase 2 submission.

Phase 2 stays focused on the stable mock-based product:
- mock disruption inputs
- real incident and claim orchestration inside the app
- fraud-aware review flow
- admin explainability for demo and operator use

Everything below is future work.

> **Executive Philosophy for Phase 3**
> Phase 3 focuses on building a **feedback-driven learning system** where model decisions are continuously evaluated against real-world outcomes before retraining. The upgrade loop ensures: `prediction → decision → human feedback → stored → retrain → evaluate → deploy`. Better models do not come from random hyperparameter tweaking; they come from building a smarter system around the ML engine.

## 🟢 Tier 1: Core Intelligence Backbone (Must Do)

> **"Tier 1 establishes the closed feedback loop required for any meaningful model improvement."**

### B. Learning And Data Pipeline

Phase 3 should add structured memory for decisions and outcomes. This is the foundation of the ML upgrade loop: learning from messy, real-world decisions rather than synthetic comfort zones.

Planned areas:
- a `training_events` or decision-log table
- storing the feature snapshot precisely as seen at decision time
- capturing the automated system decision against the final human Admin verdict (Ground Truth)
- data validation and anomaly filtering before retraining
- offline supervised retraining workflows rather than automatic self-learning
- evaluation and comparison before any model deployment

### F. Observability And Analytics Expansion

Phase 3 should improve how the system measures its own behavior, ensuring it is auditable instead of flying blind post-deployment.

Planned areas:
- model and rule drift detection (is distribution changing over time?)
- false review rate tracking (are we over-sending legitimate claims to the Admin Queue?)
- stronger zero-touch and auto-approval tracking (are auto-approvals legitimately safe?)
- better long-window operational summaries
- richer admin analytics for queue behavior and decision quality

## 🟡 Tier 2: Real-World Hardening (High Value)

### C. Advanced Fraud Detection

Phase 3 should move beyond the current hybrid baseline. Fraud models break if engineered blindly; they must learn from real operational patterns.

Planned areas:
- stronger feature engineering based on real usage patterns
- fraud-pattern learning from real operating data (repeated location anomalies, timing inconsistencies)
- better separation of weak and strong suspicious signals
- threshold calibration based on review outcomes

### A. Real Provider Integration

Phase 3 should replace the mock signal layer with real external providers. Improved input fidelity directly improves model reliability.

Planned areas:
- live weather APIs (OpenWeather)
- live AQI APIs (WAQI)
- live traffic APIs (TomTom)
- replacing mock providers without rewriting the claim flow
- provider rate limiting
- fallback behavior gracefully degrading when providers are unavailable
- stale-data handling and freshness rules

## 🔵 Tier 3: System Adaptation & Polish

### D. System Adaptation

Phase 3 should make the system better at adapting to operating pressure. Moving from static logic to adaptive systems.

Planned areas:
- dynamic thresholds based on queue pressure (tensing uncertainty bands if SLAs breach)
- stronger confidence calibration routing uncertain cases to admin queues
- better use of review feedback to reduce unnecessary delays
- safer automation bands for approve, review, and reject behavior

### E. Payout Integration (Simulated)

Phase 3 should make payout handling feel more product-complete while still staying safe for demo use.

Planned areas:
- mock payment gateway integration
- clearer instant payout flow
- richer payout status tracking
- improved payout notifications and audit visibility

## Phase 3 Guiding Rule

Phase 3 should expand the system carefully:
- keep the current stable Phase 2 flow intact
- build the systemic feedback constraints that logically justify every ML upgrade
- evaluate new behavior in controlled conditions before deployment
- avoid presenting future architecture as already implemented
