# 🛵 RideShield — Parametric AI Insurance for Gig Delivery Workers

> **"Claims are automatically initiated by the system. Delivery partners never file claims."**

A recharge-style, AI-powered parametric insurance system that protects Zomato delivery partners' income in real-time — triggered by rain, pollution, platform outages, and curfews — using multi-signal fraud detection and zero-touch payouts.

---

## ✅ Requirement Coverage

| Requirement | Status |
|---|---|
| Weekly pricing model | ✔ Covered — formula, 4 plan tiers, worked example |
| AI risk profiling | ✔ Covered — regression model, city + weather + social inputs |
| Parametric triggers (5 types) | ✔ Covered — rain, AQI, traffic, platform, social |
| Zero-touch claim automation | ✔ Covered — no worker action required, system-initiated |
| Fraud detection | ✔ Covered — anomaly scoring, cluster detection, trust system |
| Analytics dashboard | ✔ Covered — worker + admin views with defined metrics |
| Payout processing | ✔ Covered — Razorpay sandbox + UPI simulator |
| Worker onboarding | ✔ Covered — workflow step 1, risk score on signup |
| Income-only scope | ✔ Enforced — no health, accident, or vehicle coverage |

---

## 📌 Table of Contents

1. [Requirement Coverage](#-requirement-coverage)
2. [Problem & Persona](#-problem--persona)
3. [Persona-Based Scenario](#-persona-based-scenario)
4. [System Workflow](#-system-workflow)
5. [Weekly Premium Model](#-weekly-premium-model)
6. [Parametric Triggers](#-parametric-trigger-engine)
7. [AI/ML Integration](#-aiml-integration)
8. [Tech Stack](#-tech-stack)
9. [Development Plan](#-development-plan)
10. [Analytics Dashboard](#-analytics-dashboard)
11. [Platform Justification](#-platform-justification-web)
12. [Innovation & Extras](#-innovation--extras)

---

## 🚨 Problem & Persona

### The Problem
Gig delivery workers lose **20–30% of their weekly income** due to disruptions beyond their control:

| Disruption Type | Examples |
|---|---|
| 🌧 Environmental | Heavy rain, extreme heat, AQI spikes |
| ⚡ Platform | App outages, low order density |
| 🚨 Social | Government curfews, local strikes, zone closures |

**Current Gap:**
- ❌ No income protection product exists for gig workers
- ❌ No real-time, automated compensation mechanism
- ❌ Traditional insurance is too slow, manual, and health/accident-focused

### The Persona: Rahul

> Rahul is a 28-year-old Zomato delivery partner in Delhi. He owns a bike and works 8–10 hours daily. His income depends entirely on the number of deliveries he completes. One rainy afternoon can wipe out ₹300–₹400 from his day.

| Attribute | Value |
|---|---|
| City | Delhi |
| Platform | Zomato |
| Earnings per delivery | ₹25–₹40 |
| Deliveries per hour | 2–3 |
| Average daily income | ₹800–₹1,000 |
| Working hours | 8–10 hrs/day |

**What Rahul needs:** A simple, affordable, automatic safety net that pays him when the world makes it impossible to work — without paperwork, without waiting, without filing anything.

---

## 🎬 Persona-Based Scenario

### Scenario 1 ✅ — Legitimate Claim (Rain + Traffic)

> *Delhi, Tuesday, 2:00 PM*

Rahul starts his shift at 10 AM. He completes 6 deliveries in 2 hours. At 2 PM, heavy rainfall begins — measured at 48mm/hr, exceeding our 25mm/hr threshold.

**What the system does automatically:**
1. Weather API detects rainfall crossing threshold
2. Rahul's GPS confirms he was active in the affected zone before disruption
3. Platform data shows order density dropped 70% in his area
4. Multi-signal validation confirms event is real (confidence: 0.87)
5. Movement pattern confirms Rahul was genuinely trying to work
6. Fraud score: 0.18 → clean
7. **Claim auto-generated. ₹280 credited to wallet in 90 seconds.**

Rahul receives a notification: *"Heavy rain detected. ₹280 income protection credited."*

---

### Scenario 2 ❌ — Fraud Attempt (Fake GPS + No Activity)

> *Delhi, Same Tuesday*

Another user, Vikram, registers from the same location as Rahul. He has been completely stationary for 6 hours. He's part of a cluster of 23 users from the same 500m radius all triggering claims at the same timestamp.

**What the system does:**
1. Cluster detection fires: 23 users, same geofence, same timestamp
2. Vikram's movement pattern shows zero delivery stops
3. Speed data shows no bike movement
4. IP address mismatches registered device
5. Fraud score: 0.81 → **Claim rejected automatically**

---

### Scenario 3 ⚠️ — Edge Case (Curfew, Ambiguous Activity)

> *Delhi, Friday evening — Section 144 imposed*

A curfew is declared at 6 PM. Arun claims income loss. However, Arun had zero deliveries logged in the 4 hours before the curfew — suggesting he wasn't working that day.

**What the system does:**
1. Social event detected via admin flag + mass inactivity pattern
2. Arun's pre-disruption activity is near-zero
3. Confidence score is valid, but trust score is low (new user, no history)
4. Final score: 0.54 → **Claim delayed for manual review**

---

## ⚙️ System Workflow

```
[1] Worker Onboarding
    └── Name, city, platform, income, hours
    └── Risk score generated
    └── Weekly plan recommended & purchased
         ↓
[2] Continuous Monitoring (Real-Time)
    └── Weather APIs → Rain, AQI, Heat
    └── Platform signals → Outage detection
    └── Social signals → Curfew flags, inactivity patterns
         ↓
[3] Disruption Detected
    └── Parametric trigger threshold crossed
    └── Affected zone identified
    └── Active workers in zone filtered
         ↓
[4] Multi-Signal Validation
    └── Event confidence scored (API + behavioral + historical)
    └── Worker activity verified (GPS, speed, delivery stops)
    └── Fraud detection model runs
    └── Cluster fraud check
         ↓
[5] Claim Auto-Generated (Zero-Touch)
    └── Income loss calculated automatically
    └── No action required from worker
         ↓
[6] Decision Engine
    └── final_score = f(disruption, confidence, fraud, trust)
    └── Score → Instant / Delayed / Rejected
         ↓
[7] Payout Execution
    └── Channel 1: In-app wallet credit (Razorpay sandbox simulation)
    └── Channel 2: UPI direct transfer simulation (for Pro Max plan)
    └── Notification pushed to worker
    └── Claim logged with full audit trail + transaction ID
```

> ⚠️ **Zero-touch design is intentional.** Rahul never opens the app to file a claim. The system acts on his behalf the moment a valid disruption is detected.

---

## 💰 Weekly Premium Model

### Why Weekly?
Gig workers don't receive monthly salaries. Their income is daily and volatile. A weekly recharge cycle matches their earnings rhythm — affordable, flexible, and predictable.

### Premium Formula

```
weekly_premium = base_price × plan_factor × risk_score
```

| Variable | Description |
|---|---|
| `base_price` | Minimum viable premium (₹29 for Basic) |
| `plan_factor` | Coverage tier multiplier (1.0 → 2.5) |
| `risk_score` | AI-calculated score ∈ [0,1] based on city, weather history, disruption frequency |

### Risk Score Inputs
```
risk_score = f(
    city_base_risk,          // Delhi = high (AQI + traffic + density)
    historical_weather,      // last 30-day disruption frequency
    social_instability,      // curfew/strike history
    platform_reliability     // outage frequency in area
)
```

### Plans

| Plan | Weekly Premium | Coverage Cap | Triggers Covered |
|---|---|---|---|
| 🟢 Basic Protect | ₹29–₹39 | ₹300 | Rain + Platform outage |
| 🟡 Smart Protect | ₹49–₹69 | ₹600 | Rain + AQI + Traffic |
| 🔴 Assured Plan | ₹79–₹99 | ₹800 | All triggers + guaranteed min payout |
| 🟣 Pro Max | ₹109–₹129 | ₹1,000 | All triggers + predictive protection + instant payout |

### Example Calculation
```
Rahul selects Smart Protect
base_price = ₹39
plan_factor = 1.5
risk_score = 0.6 (Delhi, monsoon week)

weekly_premium = 39 × 1.5 × 0.6 = ₹35.10 → rounded to ₹35/week
```

> Premium is capped at a ±20% change week-over-week to prevent pricing shock.

### Viability Basis

A natural question: *how does ₹29–₹35/week cover a ₹300 claim?*

The answer is standard risk pooling — not every worker files a claim every week:

```
Delhi avg payable disruptions:  ~2–3 events/month
Average payout per event:       ~₹150 (disruption_duration × income_per_hour)
Claim approval rate:            ~60% (fraud + ineligibility filter)

Expected monthly payout/worker: 2.5 events × ₹150 × 0.60 = ₹225/month
Worker pays (Smart Protect):    ₹35/week × 4 = ₹140/month

Pool sustainability:
- ~40% of active policy holders have no payable disruption in a given week
- Their premiums subsidise the 60% who do — identical to how all insurance works
- Higher-risk weeks (monsoon) → risk_score rises → premium rises automatically
```

The weekly model also reduces adverse selection: workers can't buy coverage *only* during predicted rain weeks because the premium adjusts upward the moment the forecast worsens.

---

## 🌩️ Parametric Trigger Engine

### What is Parametric Insurance?
Unlike traditional insurance (which reimburses actual documented losses), parametric insurance pays out automatically when a **measurable external condition** crosses a predefined threshold — no claim filing, no investigation.

### Trigger Table

| Trigger | Condition | Source |
|---|---|---|
| 🌧 Rain | Rainfall > 25mm/hr | OpenWeather API |
| 🌫 AQI | AQI > 300 (Hazardous) | AQI API / CPCB |
| 🚧 Traffic | Congestion index > 0.75 | HERE Maps / TomTom |
| ⚡ Platform Outage | Order density drop > 60% in zone | Platform simulation |
| 🚨 Social Event | Admin flag OR mass inactivity pattern | Admin panel + inference |

### Multi-Trigger Disruption Score

When multiple triggers fire simultaneously, the system calculates a composite score:

```
disruption_score =
    0.25 × weather_signal +
    0.20 × AQI_signal +
    0.15 × traffic_signal +
    0.20 × platform_signal +
    0.20 × social_signal
```

This prevents over-payment for mild single events and enables proportional payouts for compound disruptions (e.g., rain + traffic + curfew).

### Event Confidence Layer

Not all API signals are equally reliable. Each trigger carries a confidence weight:

```
event_confidence =
    0.50 × API_reliability +
    0.30 × behavioral_consistency +  // mass inactivity validates event
    0.20 × historical_match           // does this match past patterns?
```

> If no external API is available (e.g., no curfew API exists), social events are detected through **mass inactivity patterns** — if 40%+ of workers in a zone go offline simultaneously, a social disruption is inferred.

---

## 🧠 AI/ML Integration

### 1. Risk Scoring Model (Pricing)
- **What it does:** Calculates `risk_score` per worker per week based on city, zone, season, and historical disruption data
- **Why:** Enables fair, dynamic pricing — Delhi monsoon week costs more than a dry winter week
- **ML approach:** Regression model trained on weather + disruption history data

### 2. Fraud Detection Model
- **What it does:** Computes `fraud_score ∈ [0,1]` by analyzing multiple behavioral and contextual signals
- **Signals used:**
  - GPS movement pattern (impossible distance, no delivery stops)
  - Device/IP consistency
  - Activity before disruption (was worker actually working?)
  - Cluster co-location (many users, same spot, same time)
  - Social event cross-validation (curfew claimed but no prior activity)
- **ML approach:** Anomaly detection + rule-based scoring hybrid
- **Formula:**
```
fraud_score = w1×movement + w2×ip_mismatch + w3×inactivity +
              w4×cluster_flag + w5×social_mismatch
```

### 3. Cluster Fraud Detection
- **What it does:** Groups claim attempts by geofence + timestamp. If >N users from the same 500m zone file at the same moment, cluster fraud is flagged
- **Why:** Coordinated fraud rings are the highest-risk attack vector for parametric systems
- **Smart filtering:** Not all cluster users are rejected — those with valid prior activity are still approved

### 4. Trust Score System
- **What it does:** Builds a long-term behavioral profile per worker
- **Effect:** High-trust workers (consistent history, no flags) get fraud score reduction
```
adjusted_fraud = fraud_score - (0.2 × trust_score)
```

### 5. Decision Engine
Combines all signals into a single payout decision:
```
final_score =
    0.35 × disruption_score +
    0.25 × event_confidence +
    0.25 × (1 - fraud_score) +
    0.15 × trust_score
```

| Score Range | Decision |
|---|---|
| > 0.70 | 💸 Instant payout |
| 0.50–0.70 | ⏳ Delayed (review queue) |
| < 0.50 | ❌ Rejected |

### 6. Income Loss Calculation
```
income_per_hour = final_verified_income / working_hours
payout = income_per_hour × disruption_duration_hours

Constraints:
- payout ≤ plan_coverage_cap
- payout ≤ city_avg_income × 1.5   // anti-inflation cap
- final_income = weighted(self_reported, platform_data, behavioral)
```

### 7. Predictive Pricing (Pro Max Plan)
- Forecasts weather and AQI for next 24–48 hours
- Notifies workers of upcoming high-risk periods
- Allows advance coverage activation
- Premium adjustment capped at ±20% to prevent pricing shock

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React.js (Web) | Fast development, component reuse, responsive dashboard |
| Backend | FastAPI (Python) | High performance, async support, ML-friendly |
| Database | PostgreSQL | Relational data for workers, policies, claims, transactions |
| Weather API | OpenWeatherMap | Real-time rainfall and temperature data |
| AQI API | WAQI / CPCB | Delhi-specific pollution data |
| Traffic API | TomTom / HERE Maps | Congestion index per zone |
| Payments | Razorpay Sandbox | Simulated instant wallet credits |
| Payments (alt) | UPI Simulator | Direct bank transfer simulation for Pro Max plan |
| ML Models | Scikit-learn | Risk scoring, fraud detection |
| Hosting | Vercel (Frontend) + Render (Backend) | Free tier, fast deployment for demo |
| Maps/Geo | Leaflet.js | Zone visualization and GPS validation |

---

## 🗓️ Development Plan

### Phase 1 (March 4–20): Foundation ✅ IN PROGRESS
- [x] Problem research and persona definition
- [x] System architecture design
- [x] Risk model and fraud model logic design
- [x] README and documentation
- [ ] Repository setup with folder structure
- [ ] Prototype wireframes (minimal UI)

### Phase 2 (March 21 – April ~10): Core Build
- [ ] Worker onboarding API
- [ ] Policy creation and weekly premium engine
- [ ] Parametric trigger monitoring service (simulated APIs)
- [ ] Fraud detection module (ML model + rules)
- [ ] Claim auto-generation engine
- [ ] Decision engine implementation
- [ ] Basic worker dashboard (React)

### Phase 3 (April ~11–30): Polish & Demo
- [ ] Admin dashboard (fraud stats, cluster alerts, analytics)
- [ ] Razorpay sandbox payment integration
- [ ] Predictive pricing module
- [ ] Demo scenario runner (3 pre-built scenarios)
- [ ] End-to-end testing
- [ ] Final video walkthrough

---

## 📊 Analytics Dashboard

### Worker Dashboard
Every worker sees a personal weekly summary tied to their active plan:

| Metric | Description |
|---|---|
| Active plan & expiry | Current plan name, coverage cap, days remaining |
| Weekly earnings protected | Total income shielded by active coverage this week |
| Claims this week | Count of auto-triggered claims + their status (instant / delayed / rejected) |
| Payout history | Last 4 weeks of credited amounts with timestamps |
| Disruption alerts | Live feed — active triggers in the worker's zone right now |
| Trust score indicator | Visual badge showing account standing (affects fraud leniency) |

### Admin / Insurer Dashboard
Operational and predictive metrics for the insurance operator:

| Metric | Description |
|---|---|
| Total active policies | Count of weekly plans currently in force, broken down by plan tier |
| Claims volume | Daily/weekly claim count with approve / delay / reject breakdown |
| Fraud rate | % of claims flagged, cluster alerts with zone + timestamp |
| Payout vs premium ratio | Loss ratio per plan tier — viability signal for pricing |
| Disruption map | Heatmap of active triggers across Delhi zones in real-time |
| Next-week forecast | Predicted high-risk zones based on weather + AQI forecast (Pro Max feature) |
| Worker activity index | Aggregate movement data showing city-wide delivery activity levels |

> Both dashboards are built in Phase 3 using React + recharts, backed by the same PostgreSQL claims and events tables used by the payout engine.

---

## 📱 Platform Justification: Web

We chose a **web platform** over mobile for the following reasons:

1. **Demo-first:** A web dashboard is faster to build and easier to demo during judging — no APK install required
2. **Admin panel requirement:** The fraud and analytics dashboard is better suited to a browser interface
3. **Responsive design:** Works on phone browsers without a separate mobile build
4. **Real-world note:** A production version would be a lightweight mobile app or WhatsApp bot — but for this phase, web enables the most complete demo

---

## 🚀 Innovation & Extras

### 1. Zero-Touch Claims (Core Innovation)
No gig worker should have to file a claim after a bad day. Our system acts on their behalf. The worker's only job is to buy a weekly plan — everything else is automated.

### 2. Social Disruption Detection Without APIs
Curfews and strikes often have no API. We detect them through **mass behavioral inference**: if 40%+ of workers in a zone go offline simultaneously without weather or platform cause, a social disruption is flagged. This makes the system resilient to data gaps.

### 3. Multi-Source Income Verification
Self-reported income is never trusted alone:
```
final_income = weighted(
    0.3 × user_self_report,
    0.5 × platform_order_data,   // simulated
    0.2 × behavioral_inference   // from delivery patterns
)
final_income ≤ city_avg × 1.5    // anti-fraud cap
```

### 4. Failure Handling
| Failure | System Response |
|---|---|
| Weather API down | Use last known data + flag for manual review |
| Missing GPS data | Delay claim, request retry |
| Inconsistent signals | Partial payout + audit log |
| Platform API unavailable | Fallback to order density heuristic |

### 5. Scalability Path
- Multi-platform ready (Swiggy, Dunzo, Blinkit) — same system, different `platform_id`
- Multi-city support — each city gets a calibrated `base_risk` profile
- Extensible trigger system — new disruption types added as new weighted signals

---

## 🏁 Summary

**RideShield** is not a simple "if rain then pay" system.

It is a **multi-signal AI pipeline** that:
- Monitors 5 disruption categories in real-time
- Validates events across behavioral, API, and historical signals
- Detects individual and coordinated fraud
- Calculates fair income loss using verified data
- Issues zero-touch payouts in under 2 minutes

All wrapped in an affordable, weekly recharge model that fits how delivery partners actually earn.

> *Built for Rahul. Designed for every gig worker who loses income because the world didn't cooperate.*
