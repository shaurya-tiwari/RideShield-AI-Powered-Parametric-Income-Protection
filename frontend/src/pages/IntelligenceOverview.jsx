import { useEffect, useMemo, useState } from "react";
import { Activity, BrainCircuit, Clock3, MapPinned, ShieldAlert, TrendingUp } from "lucide-react";

import { analyticsApi } from "../api/analytics";
import { healthApi } from "../api/health";
import { locationsApi } from "../api/locations";
import SectionHeader from "../components/SectionHeader";
import { formatDateTime, formatPercent, humanizeSlug } from "../utils/formatters";

function interpretLossRatio(value) {
  if (!Number.isFinite(Number(value))) {
    return {
      tone: "bg-surface-container-low text-on-surface",
      label: "Pending",
      message: "Loss ratio is not available yet.",
    };
  }

  const ratio = Number(value);
  if (ratio >= 150) {
    return {
      tone: "badge-error",
      label: "Pressure",
      message: "Claims are outpacing current premium volume. Treat this as a pricing or simulation stress signal.",
    };
  }
  if (ratio >= 100) {
    return {
      tone: "badge-pending",
      label: "Watch",
      message: "Claims and payouts are close to or above sustainable weekly pricing. Review premium calibration.",
    };
  }
  return {
    tone: "badge-active",
    label: "Stable",
    message: "Current payouts sit within the protection envelope implied by recent premium volume.",
  };
}

function interpretFraudRate(value) {
  const rate = Number(value || 0);
  if (rate >= 20) {
    return "Elevated suspicious activity. Review rule and model thresholds.";
  }
  if (rate >= 8) {
    return "Moderate fraud pressure. Watch manual review volume and duplicate patterns.";
  }
  return "Low flagged fraud pressure in the current window.";
}

function bandTone(band) {
  switch (band) {
    case "critical":
      return {
        container: "border-l-red-600 bg-surface-container-high/40",
        pill: "badge-error",
        progress: "bg-red-600",
      };
    case "elevated":
      return {
        container: "border-l-amber-600 bg-surface-container-high/40",
        pill: "badge-pending",
        progress: "bg-amber-600",
      };
    case "guarded":
      return {
        container: "border-l-blue-600 bg-surface-container-high/40",
        pill: "badge-guarded",
        progress: "bg-blue-600",
      };
    default:
      return {
        container: "border-l-emerald-600 bg-surface-container-high/40",
        pill: "badge-active",
        progress: "bg-emerald-600",
      };
  }
}

export default function IntelligenceOverview() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState(null);
  const [locations, setLocations] = useState(null);
  const [models, setModels] = useState(null);
  const forecastReadings = useMemo(() => analytics?.next_week_forecast || [], [analytics]);
  const topForecast = useMemo(
    () =>
      [...forecastReadings].sort((a, b) => Number(b.projected_risk || 0) - Number(a.projected_risk || 0))[0] || null,
    [forecastReadings],
  );

  useEffect(() => {
    document.title = "System Intelligence | RideShield";
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [analyticsRes, configRes, locationsRes, modelsRes] = await Promise.all([
          analyticsApi.adminOverview({ days: 14 }),
          healthApi.getConfig(),
          locationsApi.config(),
          analyticsApi.models(),
        ]);
        setAnalytics(analyticsRes.data);
        setConfig(configRes.data);
        setLocations(locationsRes.data);
        setModels(modelsRes.data.models);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="panel p-8 text-center text-on-surface-variant">Loading intelligence overview...</div>;
  }

  const scheduler = config?.scheduler;
  const lossRatio = interpretLossRatio(analytics?.loss_ratio);
  const fraudMeaning = interpretFraudRate(analytics?.fraud_rate);
  const citiesMonitored = (locations?.cities || []).length;
  const fraudModel = models?.fraud_model;
  const riskModel = models?.risk_model;

  return (
    <div className="space-y-10">
      {/* Asymmetric hero section */}
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="hero-glow hero-mesh rounded-[36px] p-8 sm:p-10 fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <BrainCircuit size={13} />
            <span>Autonomous guardian</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            The logic layer behind RideShield, exposed as a readable product surface.
            <span className="hero-subtitle mt-2 block text-3xl font-bold sm:text-4xl">
              Real-time. Explainable. Autonomous.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            This page should not just show numbers. It should interpret what the engine is seeing, which city is moving
            toward pressure, and whether the current payout profile still makes sense.
          </p>
        </div>

        <div className="space-y-4">
          {/* Scheduler state with pulse-glow */}
          <div className="panel p-6 pulse-glow">
            <p className="eyebrow">Scheduler state</p>
            <p className="mt-3 text-2xl font-bold text-primary">
              {scheduler?.enabled ? "Monitoring active" : "Monitoring disabled"}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Interval {scheduler?.interval_seconds || "--"}s - last finished{" "}
              {scheduler?.last_finished_at ? formatDateTime(scheduler.last_finished_at) : "--"} - next scheduled{" "}
              {scheduler?.next_scheduled_at ? formatDateTime(scheduler.next_scheduled_at) : "--"}
            </p>
          </div>
          <div className="panel-quiet p-6">
            <p className="text-sm text-on-surface-variant">Primary interpretation</p>
            <p className="mt-2 text-lg font-semibold text-primary">
              {topForecast
                ? `${humanizeSlug(topForecast.city)} is the highest near-term pressure city.`
                : "No forecast lead city available right now."}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {topForecast
                ? `Projected risk is ${topForecast.projected_risk.toFixed(2)} with ${topForecast.active_incidents} active incident(s) already in the system.`
                : "Wait for new forecast data to identify the next operational hotspot."}
            </p>
          </div>
        </div>
      </section>

      {/* Intelligence blocks */}
      <section>
        <SectionHeader
          eyebrow="Intelligence blocks"
          title="What the system is reasoning over"
          description="This is an explanation surface, so each block should tell you what the engine watches and why it affects a worker outcome."
        />
        <div className="grid grid-cols-12 gap-5">
          {[
            {
              icon: Activity,
              title: "Trigger signals",
              body: "Rain, heat, AQI, traffic, platform outage, and social disruption signals are evaluated against zone thresholds before an incident exists.",
              span: "col-span-12 md:col-span-6",
            },
            {
              icon: MapPinned,
              title: "Zone awareness",
              body: "Cities and zones are DB-backed so monitoring, claim eligibility, and forecasting all reference the same geography truth.",
              span: "col-span-12 md:col-span-6",
            },
            {
              icon: ShieldAlert,
              title: "Fraud and trust",
              body: "Fraud score, trust score, and decision breakdown combine to reduce false positives and explain why some claims move to review.",
              span: "col-span-12 lg:col-span-6",
            },
            {
              icon: BrainCircuit,
              title: "Decision output",
              body: "Each worker gets one claim per incident window, with approval, delay, or rejection exposed as a readable path rather than a black-box result.",
              span: "col-span-12 lg:col-span-6",
            },
          ].map(({ icon: Icon, title, body, span }) => (
            <div key={title} className={`${span} group card-elevated context-panel p-8 transition-smooth hover:bg-surface-container`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface-container-low text-primary transition-smooth group-hover:scale-110 group-hover:bg-primary/10">
                <Icon size={26} />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight text-primary">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Current readings */}
      <section>
        <SectionHeader
          eyebrow="Current readings"
          title="Current system-level indicators"
          description="A metric should not appear here unless the page can explain what it means."
        />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 p-6 decision-panel lg:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Loss ratio</p>
                <p className="mt-4 text-5xl font-bold text-primary">{formatPercent(analytics?.loss_ratio, 1)}</p>
              </div>
              <span className={`pill ${lossRatio.tone}`}>{lossRatio.label}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">{lossRatio.message}</p>
          </div>
          <div className="col-span-12 p-6 context-panel md:col-span-4">
            <p className="eyebrow">Fraud rate</p>
            <p className="mt-4 text-4xl font-bold text-primary">{formatPercent(analytics?.fraud_rate, 1)}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{fraudMeaning}</p>
          </div>
          <div className="col-span-12 p-6 context-panel md:col-span-4">
            <p className="eyebrow">Cities monitored</p>
            <p className="mt-4 text-4xl font-bold text-primary">{citiesMonitored}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {(locations?.cities || []).map((city) => city.display_name).join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4">
          <div className="col-span-12 p-6 context-panel lg:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Risk model</p>
                <p className="mt-3 text-2xl font-bold text-primary">{riskModel?.version || "Unavailable"}</p>
              </div>
              <span className={`pill ${riskModel?.fallback_used ? "badge-pending" : "badge-active"}`}>
                {riskModel?.fallback_used ? "Fallback" : "Active"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-on-surface-variant">R²</p>
                <p className="mt-1 font-semibold text-primary">{riskModel?.r2_score != null ? Number(riskModel.r2_score).toFixed(3) : "--"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">MAE</p>
                <p className="mt-1 font-semibold text-primary">{riskModel?.mae != null ? Number(riskModel.mae).toFixed(3) : "--"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Samples</p>
                <p className="mt-1 font-semibold text-primary">{riskModel?.n_samples || "--"}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              This model adjusts weekly premium posture and zone-level disruption risk. It informs pricing and forecast posture rather than directly deciding payouts.
            </p>
          </div>
          <div className="col-span-12 p-6 context-panel lg:col-span-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Fraud model</p>
                <p className="mt-3 text-2xl font-bold text-primary">{fraudModel?.version || "Unavailable"}</p>
              </div>
              <span className={`pill ${fraudModel?.fallback_used ? "badge-pending" : "badge-active"}`}>
                {fraudModel?.fallback_used ? "Rule fallback" : "Hybrid active"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm">
              <div>
                <p className="text-on-surface-variant">ROC AUC</p>
                <p className="mt-1 font-semibold text-primary">{fraudModel?.roc_auc != null ? Number(fraudModel.roc_auc).toFixed(3) : "--"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Precision</p>
                <p className="mt-1 font-semibold text-primary">{fraudModel?.precision != null ? Number(fraudModel.precision).toFixed(3) : "--"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Recall</p>
                <p className="mt-1 font-semibold text-primary">{fraudModel?.recall != null ? Number(fraudModel.recall).toFixed(3) : "--"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Samples</p>
                <p className="mt-1 font-semibold text-primary">{fraudModel?.n_samples || "--"}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Fraud review uses a hybrid path: rules remain the guardrail, while the ML model adds probability and top-factor context for suspicious claims.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 context-panel p-6 lg:col-span-7">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-primary">Forecast bands</h3>
            </div>
            <div className="space-y-3">
              {forecastReadings.map((entry) => {
                const tone = bandTone(entry.band);

                return (
                  <div key={entry.city} className={`rounded-[20px] border-l-4 p-5 transition-smooth hover:shadow-md ${tone.container}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-semibold capitalize text-on-surface">{humanizeSlug(entry.city)}</p>
                      <span className={`pill text-xs font-bold capitalize ${tone.pill}`}>
                        {entry.band}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={`h-full rounded-full transition-all ${tone.progress}`}
                        style={{ width: `${Math.min(100, entry.projected_risk * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Base {entry.base_risk.toFixed(2)} - Projected {entry.projected_risk.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 context-panel p-6 lg:col-span-5">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-primary">Interpretation notes</h3>
            </div>
            <div className="space-y-4 text-sm leading-7 text-on-surface-variant">
              <p>Trigger evaluation remains threshold-based and intentionally explainable.</p>
              <p>Claims are incident-based, not trigger-stacked, so overlapping same-window events do not multiply payouts for one worker.</p>
              <p>Location awareness is DB-backed, which keeps monitoring, claim logic, and future analytics tied to the same geography source of truth.</p>
              <p>Extreme ratios on this page should be read as demo pressure signals unless the business model has been recalibrated against real premium volume.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
