<p align="center">
  <img src="banner.gif" width="100%" />
</p>

<h1 align="center">🛵 Parametric AI Insurance System</h1>

<p align="center">
  <strong>AI-powered income protection for gig workers</strong><br/>
  Built for <strong>Zomato Delivery Partners</strong>
</p>

---

## 🚨 Problem Context

Gig delivery workers lose **20–30% of their income** due to external disruptions:

* 🌧 Weather (rain, heat, AQI)
* ⚡ Platform outages
* 🚨 Social restrictions (curfews, strikes)

### Current Reality

* ❌ No income protection system
* ❌ No real-time compensation

---

## 🎯 Objective

Design a **parametric AI insurance system** that:

* Detects real-world disruptions automatically
* Calculates income loss precisely
* Triggers payouts without manual claims
* Prevents fraud using behavioral intelligence

---

## ⚠️ Constraints (Strictly Followed)

* ✔ Only income loss is covered
* ❌ No health / accident / vehicle claims
* ✔ Weekly subscription pricing (mandatory)

---

## 👤 Target Persona

**Rahul — Zomato Delivery Partner (Delhi)**

* ₹25–₹40 per delivery
* 2–3 deliveries/hour
* ₹800–₹1000/day

---

## 🌍 Disruption Categories

### 🌧 Environmental

* Heavy rain
* Extreme heat
* AQI spikes

### 🚨 Social

* Curfew
* Local strikes
* Market closures

### ⚡ Platform

* App outages
* Low order density

> Impact: **Loss of working hours → Loss of income**

---

## ⚙️ End-to-End System Flow

```
Onboarding → Risk Profiling → Weekly Policy Creation
        ↓
Real-Time Monitoring
        ↓
Disruption Detection
        ↓
Activity + Fraud Validation
        ↓
Auto Claim Generation
        ↓
Decision Engine
        ↓
Instant / Delayed / Rejected Payout
```

---

## 🧾 Onboarding Module

**Inputs:**

* Name, City
* Platform (Zomato)
* Avg daily income
* Working hours

**Outputs:**

* Worker profile
* Initial risk score
* Suggested policy

---

## 🧠 AI Risk Assessment

```
risk_score ∈ [0,1]
```

Based on:

* City risk (AQI, traffic)
* Historical weather
* Disruption frequency
* Social instability

---

## 💰 Weekly Pricing Model

```
weekly_premium = base_price + (risk_score × multiplier)
```

**Example:**

* Base = ₹30
* Risk = 0.7
  👉 Premium = ₹44/week

---

## 🌩️ Parametric Trigger Engine

| Trigger  | Condition            |
| -------- | -------------------- |
| Rain     | rainfall > threshold |
| AQI      | AQI > 300            |
| Traffic  | congestion > 0.75    |
| Platform | outage detected      |
| Social   | curfew active        |

### Multi-Trigger Intelligence

```
disruption_score =
  0.25 weather +
  0.2 AQI +
  0.15 traffic +
  0.2 platform +
  0.2 social
```

---

## 📡 Event Confidence Layer

```
event_confidence ∈ [0,1]
```

Ensures reliability using:

* Multi-source validation
* Behavioral consistency
* API trust

---

## 👨‍🔧 Activity Validation

Verifies if the worker was actually active:

* Movement (bike speed)
* Delivery stop patterns
* Active duration

---

## 🔍 Fraud Detection Engine

```
fraud_score =
  distance_anomaly +
  movement_pattern +
  inactivity +
  ip_mismatch +
  cluster_score +
  social_mismatch
```

### 🚨 Social Fraud Case

Curfew active + no user activity → flagged as fraud

### Decision Logic

| Score   | Action    |
| ------- | --------- |
| < 0.4   | ✅ Approve |
| 0.4–0.7 | ⚠ Delay   |
| > 0.7   | ❌ Reject  |

---

## 🧩 Cluster Fraud Detection

```
group by (location + time)

if count > threshold:
  cluster_flag = TRUE
```

Detects coordinated fraud attempts

---

## 💰 Income Loss Engine

```
income_per_hour = daily_income / working_hours

payout = income_per_hour × disruption_duration
```

---

## ⚖️ Decision Engine

```
final_score =
  0.35 disruption +
  0.25 confidence +
  0.25 (1 - fraud) +
  0.15 trust
```

| Score   | Outcome    |
| ------- | ---------- |
| > 0.7   | 💸 Instant |
| 0.5–0.7 | ⏳ Delayed  |
| < 0.5   | ❌ Rejected |

---

## 💳 Instant Payout System

* Razorpay (test/mock integration)
* Instant wallet credit
* Transaction logs
* Retry handling

---

## 📊 Dashboard

### 👤 Worker

* Weekly premium
* Coverage
* Claim status

### 🛠 Admin

* Fraud rate
* Alerts
* Disruption analytics

---

## 🔮 Predictive Intelligence

Example:

⚠ Rain expected → coverage adjusted proactively

---

## 🧪 Demo Scenarios

### ✅ Legit Case

Rain + valid activity → Instant payout

### ❌ Fraud Case

Fake GPS + inactivity → Rejected

### ⚠ Curfew Case

No activity → Delayed / Rejected

---

## 🧠 System Positioning

This is not a simple rule engine.

> It is a **persona-specific AI system** that evaluates environmental, social, platform, and behavioral signals to make real-time financial decisions.

---

## 🏁 Final Pitch

> A parametric insurance system for Zomato delivery partners that automatically protects income during disruptions using AI-driven risk scoring, fraud detection, and zero-touch payouts aligned with a weekly earning cycle.
