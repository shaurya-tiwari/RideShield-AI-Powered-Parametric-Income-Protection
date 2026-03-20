<p align="center">
  <img src="banner.gif" width="100%" />
</p>

<h1 align="center">🛵 Parametric AI Insurance System</h1>

<p align="center">
  <strong>Multi-Plan • Multi-Signal • Fraud-Resilient Income Protection</strong><br/>
  Built for <strong>Zomato Delivery Partners</strong>
</p>

---

## 🚨 Problem

Gig delivery workers lose **20–30% income** due to:

* 🌧 Weather (rain, heat, AQI)
* ⚡ Platform outages
* 🚨 Curfews & strikes

### Current Gap

* ❌ No income protection
* ❌ No real-time payouts

---

## 🎯 Core Idea

A **parametric AI insurance system** that:

> Detects disruptions → validates impact → calculates income → triggers payout

While ensuring:

* No single source is trusted
* Multi-signal verification
* Fraud resistance
* Flexible recharge-style plans

---

## 👤 Persona

**Rahul — Zomato Delivery Partner (Delhi)**

* ₹25–₹40 per delivery
* 2–3 deliveries/hour
* ₹800–₹1000/day
* 8–10 working hours

---

## 🌍 Disruption Sources

* 🌧 Rain
* 🌫 AQI
* 🚧 Traffic
* ⚡ Platform outages
* 🚨 Curfews / strikes

👉 Result: **Loss of working hours → Loss of income**

---

## 🧠 System Philosophy

Not:

> Trust one source

But:

> Cross-verify multiple uncertain signals before making financial decisions

---

## 🧩 Multi-Source Data Model

### Inputs from 3 Layers:

1. **User Input** (baseline)
2. **Platform Simulation** (strong signal)
3. **System Intelligence** (final authority)

---

### Final Income Calculation

```
final_income = weighted(user_input, platform_data, behavior)
final_income ≤ city_avg × 1.5
```

```
income_confidence ∈ [0,1]
```

---

## 📦 Multi-Plan System (Dynamically Calculated)

### 🟢 Basic Protect

* ₹29–₹39/week
* Rain + outage coverage
* ₹300 cap

### 🟡 Smart Protect

* ₹49–₹69/week
* Rain + AQI + traffic
* ₹600 cap

### 🔴 Assured Plan

```
guaranteed_payout = min(income × hours × confidence, cap)
```

* ₹300–₹800

### 🟣 Pro Max

* ₹109–₹129/week
* Predictive protection
* ₹400–₹1000
* Instant payout

---

## 🌍 Context-Aware Risk

```
relative_risk = current / baseline(city, time)
```

---

## 🌩 Multi-Trigger Engine

```
disruption_score =
0.25 weather +
0.2 AQI +
0.15 traffic +
0.2 platform +
0.2 social
```

---

## 🚨 Social Detection

```
social_event = admin_flag OR news OR inactivity_pattern
```

---

## 📡 Event Confidence

```
event_confidence =
0.5 API +
0.3 behavior +
0.2 history
```

### Severity Layer

```
event_severity ∈ {low, medium, high}
```

---

## 🔍 Fraud Detection

### Critical

* Impossible movement
* Cluster fraud

### Moderate

* No activity
* IP mismatch

### Low

* Minor mismatch

```
fraud_score ∈ [0,1]
```

---

## 🧩 Cluster Detection

```
if users in same location + time > threshold → cluster_flag
```

✔ Smart filtering (not all rejected)

---

## 🧠 Trust System

```
trust_score ∈ [0,1]
```

```
adjusted_fraud = fraud - (0.2 × trust)
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

### Output

| Score | Result     |
| ----- | ---------- |
| High  | 💸 Instant |
| Mid   | ⏳ Delayed  |
| Low   | ❌ Rejected |

---

## 💰 Income Loss Engine

```
income_per_hour = final_income / working_hours
payout = income_per_hour × disruption_duration
```

### Constraints

```
payout ≤ plan_limit
payout ≤ max_daily_income
```

---

## 🔮 Predictive Pricing

* Forecast weather & AQI
* Notify users
* Limit price change ≤ 20%

---

## ⚙️ System Flow

```
Trigger → Confidence → Validation → Fraud → Decision → Payout
```

---

## 💳 Payout System

* Wallet simulation
* Instant / delayed payouts

### Controls

* Logs
* Retry system
* Duplicate prevention

---

## 📊 Dashboard

### Worker

* Plan
* Premium
* Coverage

### Admin

* Fraud stats
* Alerts
* Analytics

---

## 🧪 Demo Scenarios

* ✅ Legit → Instant
* ❌ Fraud → Reject
* ⚠ Edge → Delay
* 💥 Cluster → Selective approval

---

## 🧯 Failure Handling

* API failure → fallback
* Missing data → delay
* Inconsistency → partial payout

---

## 🚀 Scalability

* Multi-platform ready
* Extensible triggers
* Adaptive pricing

---

## 🧠 Positioning

> A multi-signal AI system that makes real-time, fraud-resistant financial decisions without relying on a single source of truth.

---

## 🏁 Final Pitch

> A recharge-style, AI-powered insurance system that protects gig workers’ income using predictive risk modeling, multi-source validation, and real-time payouts.

---

## 🧨 Reality

* Adaptive
* Explainable
* Fraud-resilient
* Demo-ready
